use std::path::PathBuf;

use tracing::{error, info};

pub const SWTOR_APP_ID: &str = "1286830";
const SWTOR_INSTALL_DIR: &str = "Star Wars - The Old Republic";
const SWTOR_EXE_RELATIVE: &str = "swtor/retailclient/swtor.exe";

fn home_dir() -> Option<PathBuf> {
    std::env::var("HOME").ok().map(PathBuf::from)
}

pub fn find_steam_install_path() -> Option<PathBuf> {
    let candidates = [
        home_dir().map(|h| h.join(".local/share/Steam")),
        home_dir().map(|h| h.join(".steam/steam")),
        #[cfg(windows)]
        std::env::var_os("ProgramFiles(x86)").map(|p| PathBuf::from(p).join("Steam")),
        #[cfg(windows)]
        std::env::var_os("ProgramFiles").map(|p| PathBuf::from(p).join("Steam")),
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

pub fn find_steam_library_paths() -> Vec<PathBuf> {
    let mut libraries = Vec::new();

    if let Some(steam_path) = find_steam_install_path() {
        libraries.push(steam_path.clone());

        let libraryfolders_path = steam_path.join("steamapps/libraryfolders.vdf");
        if let Ok(contents) = std::fs::read_to_string(&libraryfolders_path) {
            for line in contents.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("\"path\"") {
                    if let Some(path) = extract_vdf_value(trimmed) {
                        // Windows paths are written with escaped backslashes ("C:\\Steam").
                        let lib_path = PathBuf::from(path.replace("\\\\", "\\"));
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

/// `<library>/steamapps` for every Steam library, in the same form Steam
/// passes to Proton as STEAM_COMPAT_LIBRARY_PATHS.
pub fn find_steamapps_paths() -> Vec<PathBuf> {
    find_steam_library_paths()
        .into_iter()
        .map(|l| l.join("steamapps"))
        .filter(|p| p.exists())
        .collect()
}

/// The SWTOR install directory (what Steam passes as STEAM_COMPAT_INSTALL_PATH).
pub fn find_swtor_install_path() -> Option<PathBuf> {
    for library in find_steam_library_paths() {
        let install = library.join("steamapps/common").join(SWTOR_INSTALL_DIR);
        if install.join(SWTOR_EXE_RELATIVE).exists() {
            info!("Found SWTOR install at: {}", install.display());
            return Some(install);
        }
    }
    error!("Could not find SWTOR install directory in any Steam library");
    None
}

/// Full path to swtor.exe on the host filesystem.
pub fn find_swtor_exe_path() -> Option<PathBuf> {
    find_swtor_install_path().map(|p| p.join(SWTOR_EXE_RELATIVE))
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

pub fn find_compat_data_path() -> Option<PathBuf> {
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
