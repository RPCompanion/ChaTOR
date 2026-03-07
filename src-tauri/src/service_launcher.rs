use std::path::{Path, PathBuf};
use std::process::{Child, Command};

use tracing::{error, info};

use crate::config;
use crate::service_connection::DEFAULT_PORT;
use crate::steam;

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
