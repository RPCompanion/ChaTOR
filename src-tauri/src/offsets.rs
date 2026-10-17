//! Hook offset tables for swtor.exe builds.
//!
//! Three sources, in priority order:
//!   1. The latest document downloaded from `offsets_url` (cached on disk).
//!   2. `offsets.json` next to the executable (user editable, shipped as a resource).
//!   3. The copy of `offsets.json` compiled into this binary.
//!
//! The merged table is sent to the service before chat capture starts; the
//! service picks the entry matching the SHA256 of the running swtor.exe.
//! The schema is shared with chator-service (`share/offsets.rs`).

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::thread;

use serde::{Deserialize, Serialize};
use tracing::{error, info, warn};

use crate::config;
use crate::dal;
use crate::network::fetch_content_blocking;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VersionOffsets {
    pub sha256: String,
    #[serde(default)]
    pub label: Option<String>,
    /// Offset name -> RVA. Accepts hex strings (`"0x5220b0"`) or numbers.
    #[serde(default, deserialize_with = "deserialize_rva_map")]
    pub offsets: BTreeMap<String, u64>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct OffsetTable {
    #[serde(default)]
    pub versions: Vec<VersionOffsets>,
}

/// Mirrors chator-service's `HookStatus`.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HookStatus {
    pub name: String,
    pub rva: Option<u64>,
    pub source: String,
    pub installed: bool,
    #[serde(default)]
    pub detail: Option<String>,
}

/// Mirrors chator-service's `HookReport`.
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct HookReport {
    pub sha256: Option<String>,
    pub dynamic_lookup: bool,
    pub hooks: Vec<HookStatus>,
}

const BUNDLED_OFFSETS_JSON: &str = include_str!("../offsets.json");
const LOCAL_FILE: &str = "offsets.json";
const REMOTE_CACHE_FILE: &str = "offsets.remote.json";

/// Accepts an RVA written either as a JSON number or as a string such as
/// `"0x5220b0"` (hex, with or without the `0x` prefix) or `"5382320"` (decimal).
fn deserialize_rva_map<'de, D>(deserializer: D) -> Result<BTreeMap<String, u64>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error;

    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Rva {
        Number(u64),
        Text(String),
    }

    let raw: BTreeMap<String, Rva> = BTreeMap::deserialize(deserializer)?;
    raw.into_iter()
        .map(|(name, rva)| {
            let value = match rva {
                Rva::Number(n) => n,
                Rva::Text(s) => parse_rva(&s)
                    .ok_or_else(|| D::Error::custom(format!("invalid RVA {:?} for {}", s, name)))?,
            };
            Ok((name, value))
        })
        .collect()
}

fn parse_rva(text: &str) -> Option<u64> {
    let t = text.trim();
    if let Some(hex) = t.strip_prefix("0x").or_else(|| t.strip_prefix("0X")) {
        u64::from_str_radix(hex, 16).ok()
    } else if t.chars().all(|c| c.is_ascii_digit()) && !t.is_empty() {
        t.parse().ok()
    } else {
        u64::from_str_radix(t, 16).ok()
    }
}

impl OffsetTable {
    pub fn from_json(contents: &str) -> Result<OffsetTable, String> {
        serde_json::from_str(contents).map_err(|e| e.to_string())
    }

    pub fn merged(primary: &OffsetTable, fallback: &OffsetTable) -> OffsetTable {
        let mut versions = primary.versions.clone();
        for v in &fallback.versions {
            if versions
                .iter()
                .all(|p| !p.sha256.eq_ignore_ascii_case(&v.sha256))
            {
                versions.push(v.clone());
            }
        }
        OffsetTable { versions }
    }
}

fn remote_cache_path() -> PathBuf {
    PathBuf::from(dal::get_em_dirs().get_data_dir_path(REMOTE_CACHE_FILE))
}

fn load_file(path: &PathBuf, what: &str) -> Option<OffsetTable> {
    let contents = std::fs::read_to_string(path).ok()?;
    match OffsetTable::from_json(&contents) {
        Ok(t) => {
            info!("Loaded {} offsets from {} ({} version(s))", what, path.display(), t.versions.len());
            Some(t)
        }
        Err(e) => {
            warn!("Ignoring invalid {} offsets file {}: {}", what, path.display(), e);
            None
        }
    }
}

/// Builds the effective offset table from all sources.
pub fn table() -> OffsetTable {
    let bundled = OffsetTable::from_json(BUNDLED_OFFSETS_JSON)
        .expect("bundled offsets.json must parse");

    let local = load_file(&PathBuf::from(LOCAL_FILE), "local").unwrap_or_default();
    let remote = load_file(&remote_cache_path(), "downloaded").unwrap_or_default();

    let table = OffsetTable::merged(&remote, &OffsetTable::merged(&local, &bundled));
    info!(
        "Effective offset table has {} version(s): {:?}",
        table.versions.len(),
        table
            .versions
            .iter()
            .map(|v| format!("{}..({})", &v.sha256[..v.sha256.len().min(8)], v.label.as_deref().unwrap_or("")))
            .collect::<Vec<_>>()
    );
    table
}

/// Downloads the latest offsets document in the background and caches it.
/// Does nothing when `offsets_url` is not configured.
pub fn init() {
    let url = match config::config().offsets_url.as_deref() {
        Some(u) if !u.trim().is_empty() => u.trim().to_string(),
        _ => {
            info!("No offsets_url configured; using local offsets only");
            return;
        }
    };

    thread::spawn(move || {
        info!("Fetching offsets from {}", url);
        let bytes = match fetch_content_blocking(url.clone()) {
            Ok(b) => b,
            Err(e) => {
                warn!("Offsets download failed ({}); using cached/local offsets", e);
                return;
            }
        };
        let text = match String::from_utf8(bytes) {
            Ok(t) => t,
            Err(_) => {
                warn!("Offsets download was not valid UTF-8; ignoring");
                return;
            }
        };
        match OffsetTable::from_json(&text) {
            Ok(t) => {
                let path = remote_cache_path();
                if let Some(parent) = path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }
                match std::fs::write(&path, &text) {
                    Ok(()) => info!(
                        "Cached {} downloaded offset version(s) to {}",
                        t.versions.len(),
                        path.display()
                    ),
                    Err(e) => error!("Failed to cache offsets to {}: {}", path.display(), e),
                }
            }
            Err(e) => warn!("Downloaded offsets document is invalid; ignoring: {}", e),
        }
    });
}
