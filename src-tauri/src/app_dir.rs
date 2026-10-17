//! Locates the directory that holds ChaTOR's bundled files (config.toml,
//! offsets.json, sql/, gamedata/, service/) and makes it the working directory.
//!
//! The code base reads those files by relative path, which only worked when the
//! app was started from its own folder. Packaged builds start from wherever the
//! desktop launches them, so we look in the usual places Tauri puts resources:
//! next to the executable (Windows / portable zip), `../lib/<name>` (deb/rpm),
//! `$APPDIR/usr/lib/<name>` (AppImage), or the current directory (dev).

use std::path::{Path, PathBuf};

const MARKER: &str = "config.toml";
const NAMES: [&str; 2] = ["chator", "ChaTOR"];

fn candidates() -> Vec<PathBuf> {
    let mut out = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        out.push(cwd);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            out.push(dir.to_path_buf());
            for name in NAMES {
                out.push(dir.join("..").join("lib").join(name));
            }
            out.push(dir.join("..").join("Resources"));
        }
    }
    if let Ok(appdir) = std::env::var("APPDIR") {
        for name in NAMES {
            out.push(Path::new(&appdir).join("usr").join("lib").join(name));
        }
    }
    out
}

/// Returns the resolved app directory, after `chdir`-ing into it. Falls back to
/// the current directory (unchanged) when nothing contains `config.toml`.
pub fn resolve_and_enter() -> PathBuf {
    for dir in candidates() {
        if dir.join(MARKER).is_file() {
            let dir = dir.canonicalize().unwrap_or(dir);
            if std::env::set_current_dir(&dir).is_ok() {
                return dir;
            }
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

/// True when the current directory accepts new files (packaged installs under
/// /usr or Program Files usually do not).
pub fn cwd_is_writable() -> bool {
    let probe = Path::new(".chator-write-test");
    match std::fs::write(probe, b"") {
        Ok(()) => {
            let _ = std::fs::remove_file(probe);
            true
        }
        Err(_) => false,
    }
}
