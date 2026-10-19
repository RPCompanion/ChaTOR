
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use std::time::Instant;

use base64::prelude::*;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use swtor_gamedata::names::Kind;
use swtor_gamedata::snapshot::{Origin, Snapshot};
use swtor_gamedata::tooltip::{GameData, Tooltip};
use tauri::{AppHandle, Emitter};
use tracing::{error, info, warn};

#[derive(Serialize, Deserialize)]
pub struct RawData {
    pub name: String,
    pub global_id: u64
}

/// Item / quest / achievement names by global id (the GOM node id in chat links). Starts with
/// the shipped gamedata/*.json; names read from the installed game replace and extend them once
/// `start_live_load` finishes. Shipped names stay for ids the current game no longer has.
static NAMES: RwLock<Option<HashMap<u64, (Kind, String)>>> = RwLock::new(None);

/// Item names for `search_game_items`, one entry per distinct name; built on first search and
/// dropped whenever NAMES changes.
static ITEM_SEARCH: RwLock<Option<Arc<Vec<SearchEntry>>>> = RwLock::new(None);

struct SearchEntry {
    name: String,
    lower: String,
    /// Every item with this name (item level / quality variants), ascending.
    ids: Vec<u64>,
}

/// The installed game, for item / achievement tooltips; `None` until `start_live_load` has
/// opened it (or if the game was not found).
static LIVE: RwLock<Option<Arc<GameData>>> = RwLock::new(None);

/// Index cache in the data directory, rebuilt when the game is patched.
const CACHE_FILE: &str = "gamedata.cache";

pub fn init() {

    let mut names = HashMap::new();
    for (path, kind) in [
        ("./gamedata/items.json", Kind::Item),
        ("./gamedata/quests.json", Kind::Quest),
        ("./gamedata/achievements.json", Kind::Achievement),
    ] {
        for row in get::<RawData>(path) {
            names.insert(row.global_id, (kind, row.name));
        }
    }
    info!("Loaded {} shipped game data names", names.len());
    *NAMES.write().unwrap() = Some(names);

}

/// Reads names from the installed game on a background thread and emits `game_data_ready`
/// when they are in place, so links that showed "<Loading>" can look up their names again.
/// `configured_install` is config.toml's `swtor_install_path`.
pub fn start_live_load(app: AppHandle, configured_install: Option<String>) {

    std::thread::spawn(move || {

        let Some(assets_dir) = find_assets_dir(configured_install) else {
            warn!("SWTOR install not found; using the shipped game data names (set swtor_install_path in config.toml)");
            return;
        };

        let cache = PathBuf::from(super::get_em_dirs().get_data_dir_path(CACHE_FILE));
        let started = Instant::now();
        let (snapshot, origin) = match Snapshot::load_or_scan(&assets_dir, &cache, "en-us") {
            Ok(result) => result,
            Err(e) => {
                error!("Could not read game data from {}: {e:#}", assets_dir.display());
                return;
            }
        };
        match origin {
            Origin::Cache => info!("Game data from cache in {:.0?}", started.elapsed()),
            Origin::Scan => info!("Game data read from {} in {:.0?} (cached)", assets_dir.display(), started.elapsed()),
            Origin::ScanNotCached(e) => warn!("Game data read in {:.0?}, but caching it failed: {e}", started.elapsed()),
        }

        match GameData::open(&assets_dir, &snapshot, "en-us") {
            Ok(data) => *LIVE.write().unwrap() = Some(Arc::new(data)),
            Err(e) => warn!("Game data tooltips unavailable (falling back to Jedipedia): {e:#}"),
        }

        let mut guard = NAMES.write().unwrap();
        let names = guard.get_or_insert_with(HashMap::new);
        let before = names.len();
        for node in snapshot.nodes {
            if let Some(name) = node.name {
                names.insert(node.id, (node.kind, name));
            }
        }
        info!("Game data names: {} ({} more than shipped)", names.len(), names.len() - before);
        drop(guard);
        *ITEM_SEARCH.write().unwrap() = None;

        let _ = app.emit("game_data_ready", ());

    });

}

/// The game's `Assets` directory: the configured install, a Steam library, or the EA/BioWare
/// launcher's default folder on Windows.
fn find_assets_dir(configured_install: Option<String>) -> Option<PathBuf> {

    let configured = configured_install.map(PathBuf::from);
    #[cfg(windows)]
    let launcher_default = std::env::var_os("ProgramFiles(x86)")
        .map(|p| PathBuf::from(p).join("Electronic Arts/BioWare/Star Wars - The Old Republic"));
    #[cfg(not(windows))]
    let launcher_default: Option<PathBuf> = None;

    configured
        .into_iter()
        .chain(crate::steam::find_swtor_install_path())
        .chain(launcher_default)
        .map(|install| install.join("Assets"))
        .find(|assets| assets.join("swtor_main_global_1.tor").exists())

}

fn get<T: DeserializeOwned>(path: &str) -> Vec<T> {

    let data = fs::read_to_string(path)
        .expect(&format!("Unable to read {}", path));

    serde_json::from_str(&data)
        .expect(&format!("Unable to parse {}", path))

}

#[tauri::command]
pub fn get_name_by_global_id(global_id: String) -> Result<String, &'static str> {

    let global_id = global_id.parse::<u64>().map_err(|_| "Invalid global id")?;
    let guard = NAMES.read().unwrap();

    match guard.as_ref().and_then(|names| names.get(&global_id)) {
        Some((_, name)) => Ok(name.clone()),
        None => {
            info!("No name found for global_id: {}", global_id);
            Err("No name found")
        }
    }

}

#[derive(Serialize)]
pub struct ItemSearchResult {
    name: String,
    /// Ids of every item with this name, as strings (JavaScript numbers lose precision).
    ids: Vec<String>,
}

fn item_search_index() -> Arc<Vec<SearchEntry>> {

    if let Some(index) = ITEM_SEARCH.read().unwrap().as_ref() {
        return index.clone();
    }

    let mut by_name: HashMap<String, SearchEntry> = HashMap::new();
    if let Some(names) = NAMES.read().unwrap().as_ref() {
        for (id, (kind, name)) in names {
            if *kind != Kind::Item {
                continue;
            }
            let lower = name.to_lowercase();
            by_name
                .entry(lower.clone())
                .or_insert_with(|| SearchEntry { name: name.clone(), lower, ids: Vec::new() })
                .ids
                .push(*id);
        }
    }
    let mut entries: Vec<SearchEntry> = by_name.into_values().collect();
    for entry in &mut entries {
        entry.ids.sort_unstable();
    }
    let index = Arc::new(entries);
    *ITEM_SEARCH.write().unwrap() = Some(index.clone());
    index

}

/// Items whose name contains every word of `query`: exact matches first, then names starting
/// with the query, then names where every word starts a word, then the rest; shorter names first.
fn search_items(query: &str, limit: usize) -> Vec<ItemSearchResult> {

    let query = query.trim().to_lowercase();
    let terms: Vec<&str> = query.split_whitespace().collect();
    if query.chars().count() < 2 || terms.is_empty() {
        return Vec::new();
    }

    let starts_word = |text: &str, term: &str| {
        text.match_indices(term).any(|(at, _)| at == 0 || !text[..at].ends_with(char::is_alphanumeric))
    };
    let index = item_search_index();
    let mut hits: Vec<(u8, &SearchEntry)> = index
        .iter()
        .filter(|e| terms.iter().all(|t| e.lower.contains(t)))
        .map(|e| {
            let rank = if e.lower == query {
                0
            } else if e.lower.starts_with(&query) {
                1
            } else if terms.iter().all(|t| starts_word(&e.lower, t)) {
                2
            } else {
                3
            };
            (rank, e)
        })
        .collect();
    hits.sort_by(|a, b| a.0.cmp(&b.0).then(a.1.name.len().cmp(&b.1.name.len())).then_with(|| a.1.name.cmp(&b.1.name)));

    hits.into_iter()
        .take(limit)
        .map(|(_, e)| ItemSearchResult { name: e.name.clone(), ids: e.ids.iter().map(u64::to_string).collect() })
        .collect()

}

/// Item search for the "Items" panel on the chat pages (at most 60 distinct names).
#[tauri::command]
pub async fn search_game_items(query: String) -> Vec<ItemSearchResult> {

    tauri::async_runtime::spawn_blocking(move || search_items(&query, 60))
        .await
        .unwrap_or_default()

}

/// A tooltip with its icon as a data URL.
#[derive(Serialize)]
pub struct GameTooltip {
    #[serde(flatten)]
    tooltip: Tooltip,
    icon_url: Option<String>,
}

/// Item / achievement tooltip read from the installed game. Errors when the game data is not
/// available, in which case the frontend falls back to Jedipedia.
#[tauri::command]
pub async fn get_game_tooltip(global_id: String) -> Result<GameTooltip, String> {

    let global_id = global_id.parse::<u64>().map_err(|_| "Invalid global id".to_string())?;
    let data = LIVE.read().unwrap().clone().ok_or_else(|| "Game data not loaded".to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        let tooltip = data
            .tooltip(global_id)
            .map_err(|e| format!("{e:#}"))?
            .ok_or_else(|| "No tooltip for this id".to_string())?;
        let icon = match &tooltip {
            Tooltip::Item(item) => item.icon.clone(),
            Tooltip::Achievement(achievement) => achievement.icon.clone(),
            Tooltip::Quest(_) => None,
        };
        let icon_url = match icon.map(|name| data.icon_png(&name)) {
            Some(Ok(Some(png))) => Some(format!("data:image/png;base64,{}", BASE64_STANDARD.encode(png))),
            Some(Err(e)) => {
                warn!("Icon for {global_id}: {e:#}");
                None
            }
            _ => None,
        };
        Ok(GameTooltip { tooltip, icon_url })
    })
    .await
    .map_err(|e| e.to_string())?

}

/// Chat link markup (`<HL LID="...">`) for an item, as the game would put it in a message.
/// Needs the installed game's data; errors for ids that are not items.
#[tauri::command]
pub async fn get_item_link(global_id: String) -> Result<String, String> {

    let global_id = global_id.parse::<u64>().map_err(|_| "Invalid global id".to_string())?;
    let data = LIVE.read().unwrap().clone().ok_or_else(|| "Game data not loaded".to_string())?;

    tauri::async_runtime::spawn_blocking(move || {
        data.item_link(global_id)
            .map_err(|e| format!("{e:#}"))?
            .ok_or_else(|| "Not an item".to_string())
    })
    .await
    .map_err(|e| e.to_string())?

}

#[cfg(test)]
mod tests {
    use super::*;

    /// Runs against the local install when one is found; passes silently otherwise.
    #[test]
    fn reads_names_from_the_installed_game() {
        let Some(assets) = find_assets_dir(None) else { return };
        let cache = std::env::temp_dir().join(format!("chator-gamedata-test-{}.cache", std::process::id()));

        let started = Instant::now();
        let (snapshot, first) = Snapshot::load_or_scan(&assets, &cache, "en-us").unwrap();
        let scan = started.elapsed();
        let started = Instant::now();
        let (_, second) = Snapshot::load_or_scan(&assets, &cache, "en-us").unwrap();
        let load = started.elapsed();
        let _ = std::fs::remove_file(&cache);

        assert!(matches!(first, Origin::Scan) && matches!(second, Origin::Cache));
        let datacore = snapshot.nodes.iter().find(|n| n.id == 16141067450205160335).unwrap();
        assert_eq!(datacore.name.as_deref(), Some("C-13 Prototype Droid Datacore"));

        let started = Instant::now();
        let data = GameData::open(&assets, &snapshot, "en-us").unwrap();
        let open = started.elapsed();
        let started = Instant::now();
        let Some(Tooltip::Item(rifle)) = data.tooltip(16141090338075982199).unwrap() else { panic!("no item tooltip") };
        let first_tooltip = started.elapsed();
        assert_eq!(rifle.name.as_deref(), Some("Infiltrator's Compact Sniper Rifle"));
        assert_eq!(rifle.modifications.iter().map(|m| m.slot.as_str()).collect::<Vec<_>>(),
                   ["Color Crystal", "Barrel", "Mod", "Enhancement", "Tuning", "Augment"]);
        let png = data.icon_png(rifle.icon.as_deref().unwrap()).unwrap().unwrap();
        assert!(png.starts_with(b"\x89PNG"));
        println!("{}: scan {scan:.0?}, cache load {load:.0?}, open {open:.0?}, first tooltip {first_tooltip:.0?}", assets.display());
    }

    #[test]
    fn item_search_finds_and_ranks_installed_items() {
        let Some(assets) = find_assets_dir(None) else { return };
        let cache = std::env::temp_dir().join(format!("chator-gamedata-search-{}.cache", std::process::id()));
        let (snapshot, _) = Snapshot::load_or_scan(&assets, &cache, "en-us").unwrap();
        let _ = std::fs::remove_file(&cache);
        *NAMES.write().unwrap() = Some(
            snapshot.nodes.into_iter().filter_map(|n| Some((n.id, (n.kind, n.name?)))).collect(),
        );
        *ITEM_SEARCH.write().unwrap() = None;

        let started = Instant::now();
        item_search_index();
        let build = started.elapsed();
        for query in ["temptation", "red crystal", "sniper rifle", "stim"] {
            let started = Instant::now();
            let results = search_items(query, 60);
            println!("{query:>14}: {:>2} results in {:.1?}, first: {:?}", results.len(), started.elapsed(),
                     results.iter().take(3).map(|r| (r.name.as_str(), r.ids.len())).collect::<Vec<_>>());
        }
        println!("index built in {build:.0?}");

        let temptation = search_items("temptation", 60);
        assert_eq!(temptation[0].name, "Temptation", "exact match ranks first");
        assert!(temptation[0].ids.contains(&"16140928196061234221".to_string()));
        assert!(search_items("red crystal", 60).iter().all(|r| {
            let l = r.name.to_lowercase();
            l.contains("red") && l.contains("crystal")
        }));
        assert!(search_items("x", 60).is_empty(), "one letter is too short");
    }
}

