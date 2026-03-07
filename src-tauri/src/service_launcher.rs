use std::path::{Path, PathBuf};
use std::process::{Child, Command};

use tracing::{error, info};

use crate::config;
use crate::service_connection::DEFAULT_PORT;

const SWTOR_APP_ID: &str = "1286830";

fn home_dir() -> Option<PathBuf> {
    std::env::var("HOME").ok().map(PathBuf::from)
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
    let compat_data_path = find_compat_data_path()?;
    let steam_install_path = find_steam_install_path()?;

    info!(
        "Launching service via Proton:\n  proton: {}\n  compat_data: {}\n  binary: {} {}",
        proton_path.display(),
        compat_data_path.display(),
        binary_path,
        address
    );

    match Command::new("python3")
        .arg(&proton_path)
        .arg("run")
        .arg(binary_path)
        .arg(address)
        .env("STEAM_COMPAT_DATA_PATH", &compat_data_path)
        .env("STEAM_COMPAT_CLIENT_INSTALL_PATH", &steam_install_path)
        .spawn()
    {
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

fn find_steam_install_path() -> Option<PathBuf> {
    let candidates = [
        home_dir().map(|h| h.join(".local/share/Steam")),
        home_dir().map(|h| h.join(".steam/steam")),
    ];

    for candidate in candidates.into_iter().flatten() {
        if candidate.join("steamapps").exists() {
            info!("Found Steam install at: {}", candidate.display());
            return Some(candidate);
        }
    }

    error!("Could not find Steam installation");
    None
}

fn find_steam_library_paths() -> Vec<PathBuf> {
    let mut libraries = Vec::new();

    if let Some(steam_path) = find_steam_install_path() {
        libraries.push(steam_path.clone());

        let libraryfolders_path = steam_path.join("steamapps/libraryfolders.vdf");
        if let Ok(contents) = std::fs::read_to_string(&libraryfolders_path) {
            for line in contents.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("\"path\"") {
                    if let Some(path) = extract_vdf_value(trimmed) {
                        let lib_path = PathBuf::from(path);
                        if lib_path.exists() && !libraries.contains(&lib_path) {
                            libraries.push(lib_path);
                        }
                    }
                }
            }
        }
    }

    libraries
}

fn extract_vdf_value(line: &str) -> Option<&str> {
    let mut parts = line.splitn(2, "\"path\"");
    parts.next();
    let rest = parts.next()?.trim();
    let stripped = rest.trim_start_matches(char::is_whitespace);
    if stripped.starts_with('"') {
        let inner = &stripped[1..];
        inner.find('"').map(|end| &inner[..end])
    } else {
        None
    }
}

fn find_compat_data_path() -> Option<PathBuf> {
    for library in find_steam_library_paths() {
        let compat_path = library.join(format!("steamapps/compatdata/{}", SWTOR_APP_ID));
        if compat_path.join("pfx").exists() {
            info!("Found SWTOR compat data at: {}", compat_path.display());
            return Some(compat_path);
        }
    }

    error!("Could not find SWTOR Proton prefix (app id {})", SWTOR_APP_ID);
    None
}

fn find_proton_executable() -> Option<PathBuf> {
    let compat_data = find_compat_data_path()?;
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
