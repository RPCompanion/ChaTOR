use std::path::PathBuf;

use tracing::{error, info};

const SWTOR_APP_ID: &str = "1286830";

fn home_dir() -> Option<PathBuf> {
    std::env::var("HOME").ok().map(PathBuf::from)
}

pub fn find_steam_install_path() -> Option<PathBuf> {
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
