//! Launches chator-service and keeps it alive.
//!
//! The service connects *to* ChaTOR (ChaTOR owns the TCP listener) and exits
//! on its own when that connection drops, so shutting ChaTOR down shuts the
//! service down too. What this module adds on top of that:
//!   * a supervisor thread that waits on the child, reaps it, and relaunches it
//!     if it exits while ChaTOR is still running (crash, or a lost race against
//!     the listener at startup), with backoff and a cap on rapid failures;
//!   * a shutdown flag so the supervisor does not relaunch during app exit.
//! On Linux the child is Proton's `proton run` wrapper, which blocks until the
//! Windows process exits, so waiting on it tracks the real service lifetime.

use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};

use tracing::{error, info, warn};

use crate::config;
use crate::service_connection::DEFAULT_PORT;
use crate::steam;

static SHUTTING_DOWN: AtomicBool = AtomicBool::new(false);

/// Relaunch delay after the service exits.
const RESTART_DELAY: Duration = Duration::from_secs(2);
/// A run shorter than this counts as a rapid failure.
const RAPID_FAILURE_WINDOW: Duration = Duration::from_secs(30);
/// Give up after this many consecutive rapid failures.
const MAX_RAPID_FAILURES: u32 = 5;

/// Marks the app as exiting so the supervisor stops relaunching the service.
pub fn mark_shutting_down() {
    SHUTTING_DOWN.store(true, Ordering::SeqCst);
}

fn shutting_down() -> bool {
    SHUTTING_DOWN.load(Ordering::SeqCst)
}

/// Launches the service and supervises it on a background thread.
pub fn start_supervisor() {
    thread::Builder::new()
        .name("service-supervisor".into())
        .spawn(supervise)
        .expect("failed to spawn service supervisor thread");
}

fn supervise() {
    let mut rapid_failures: u32 = 0;

    loop {
        if shutting_down() {
            return;
        }

        let started = Instant::now();
        let mut child = match launch_service() {
            Some(c) => c,
            None => {
                error!("Service could not be launched; not retrying (fix the configuration and restart ChaTOR)");
                return;
            }
        };

        let status = child.wait();
        let ran_for = started.elapsed();

        if shutting_down() {
            info!("Service exited during shutdown ({:?})", status.ok());
            return;
        }

        match &status {
            Ok(st) => warn!("Service exited ({}), ran for {:.1}s", st, ran_for.as_secs_f32()),
            Err(e) => error!("Failed waiting on service process: {}", e),
        }

        if ran_for < RAPID_FAILURE_WINDOW {
            rapid_failures += 1;
            if rapid_failures >= MAX_RAPID_FAILURES {
                error!(
                    "Service failed {} times in a row within {}s of starting; giving up. Restart ChaTOR to try again.",
                    rapid_failures,
                    RAPID_FAILURE_WINDOW.as_secs()
                );
                return;
            }
        } else {
            rapid_failures = 0;
        }

        info!("Relaunching service in {:?}", RESTART_DELAY);
        thread::sleep(RESTART_DELAY);
    }
}

pub fn launch_service() -> Option<Child> {
    let binary_path = &config::config().service_binary_path;

    if !Path::new(binary_path).exists() {
        error!("Service binary not found at: {}", binary_path);
        return None;
    }

    let address = format!("127.0.0.1:{}", DEFAULT_PORT);

    if cfg!(target_os = "windows") {
        launch_native(binary_path, &address)
    } else {
        launch_via_proton(binary_path, &address)
    }
}

fn launch_native(binary_path: &str, address: &str) -> Option<Child> {
    info!("Launching service natively: {} {}", binary_path, address);

    match Command::new(binary_path).arg(address).spawn() {
        Ok(child) => {
            info!("Service launched (pid: {})", child.id());
            Some(child)
        }
        Err(e) => {
            error!("Failed to launch service: {}", e);
            None
        }
    }
}

fn launch_via_proton(binary_path: &str, address: &str) -> Option<Child> {
    let proton_path = find_proton_executable()?;
    let compat_data_path = steam::find_compat_data_path()?;
    let steam_install_path = steam::find_steam_install_path()?;

    info!(
        "Launching service via Proton:\n  proton: {}\n  compat_data: {}\n  binary: {} {}",
        proton_path.display(),
        compat_data_path.display(),
        binary_path,
        address
    );

    // Proton rewrites the prefix's drive letters on every `proton run`: without
    // STEAM_COMPAT_LIBRARY_PATHS / STEAM_COMPAT_INSTALL_PATH it *removes* the
    // game drive (S:) that Steam created when it launched SWTOR, which breaks
    // the running game's own paths and stops the service from hashing
    // swtor.exe. So we pass the same variables Steam does.
    let library_paths = steam::find_steamapps_paths();
    let library_paths_env = std::env::join_paths(&library_paths)
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_default();
    let swtor_install = steam::find_swtor_install_path();
    let swtor_exe = steam::find_swtor_exe_path();
    // Fallback the service can read even if the S: drive letter is missing:
    // Wine always maps Z: to the host root.
    let swtor_exe_fallback = swtor_exe
        .as_ref()
        .map(|p| format!("Z:{}", p.display().to_string().replace('/', "\\")));

    let mut command = Command::new("python3");
    command
        .arg(&proton_path)
        .arg("run")
        .arg(binary_path)
        .arg(address)
        .env("STEAM_COMPAT_DATA_PATH", &compat_data_path)
        .env("STEAM_COMPAT_CLIENT_INSTALL_PATH", &steam_install_path)
        .env("STEAM_COMPAT_APP_ID", steam::SWTOR_APP_ID)
        .env("STEAM_COMPAT_LIBRARY_PATHS", &library_paths_env);
    if let Some(install) = &swtor_install {
        command.env("STEAM_COMPAT_INSTALL_PATH", install);
    }
    if let Some(fallback) = &swtor_exe_fallback {
        command.env("CHATOR_SWTOR_EXE", fallback);
    }

    info!(
        "Service environment:\n  STEAM_COMPAT_APP_ID={}\n  STEAM_COMPAT_LIBRARY_PATHS={}\n  STEAM_COMPAT_INSTALL_PATH={}\n  CHATOR_SWTOR_EXE={}",
        steam::SWTOR_APP_ID,
        library_paths_env,
        swtor_install.as_ref().map(|p| p.display().to_string()).unwrap_or_else(|| "<not found>".into()),
        swtor_exe_fallback.as_deref().unwrap_or("<not found>")
    );

    match command.spawn() {
        Ok(child) => {
            info!("Service launched via Proton (pid: {})", child.id());
            Some(child)
        }
        Err(e) => {
            error!("Failed to launch service via Proton: {}", e);
            None
        }
    }
}

fn find_proton_executable() -> Option<PathBuf> {
    let compat_data = steam::find_compat_data_path()?;
    let config_info = compat_data.join("config_info");

    let contents = match std::fs::read_to_string(&config_info) {
        Ok(c) => c,
        Err(e) => {
            error!("Could not read {}: {}", config_info.display(), e);
            return None;
        }
    };

    // Line 2 of config_info contains a path inside the Proton distribution,
    // e.g. "/home/user/.local/share/Steam/steamapps/common/Proton - Experimental/files/share/fonts/"
    // We walk up from "files/" to get the Proton root directory.
    let proton_files_path = contents.lines().nth(1)?;

    let files_marker = "/files/";
    let files_idx = proton_files_path.find(files_marker)?;
    let proton_root = PathBuf::from(&proton_files_path[..files_idx]);
    let proton_script = proton_root.join("proton");

    if proton_script.exists() {
        info!("Found Proton at: {}", proton_script.display());
        Some(proton_script)
    } else {
        error!(
            "Proton script not found at: {} (derived from config_info)",
            proton_script.display()
        );
        None
    }
}
