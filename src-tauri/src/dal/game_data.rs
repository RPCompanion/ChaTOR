
use std::fs;
use std::sync::OnceLock;

use serde::{de::DeserializeOwned, Deserialize, Serialize};
use tracing::info;

#[derive(Serialize, Deserialize)]
pub struct RawData {
    pub name: String,
    pub global_id: u64
}

pub struct GameData {
    pub names: Vec<String>,
    pub global_ids: Vec<u64>,
}

impl GameData {

    pub fn new() -> GameData {
        GameData {
            names: Vec::new(),
            global_ids: Vec::new(),
        }
    }

    pub fn extend_with_raw_data(&mut self, raw_data: Vec<RawData>) {

        for item in raw_data {
            self.names.push(item.name);
            self.global_ids.push(item.global_id);
        }

    }

}

static GAME_DATA: OnceLock<GameData> = OnceLock::new();


pub fn init() {

    let mut game_data = GameData::new();
    game_data.extend_with_raw_data(get("./gamedata/items.json"));
    game_data.extend_with_raw_data(get("./gamedata/quests.json"));
    game_data.extend_with_raw_data(get("./gamedata/achievements.json"));
    let _ = GAME_DATA.set(game_data);

}

fn get<T: DeserializeOwned>(path: &str) -> Vec<T> {

    let data = fs::read_to_string(path)
        .expect(&format!("Unable to read {}", path));

    serde_json::from_str(&data)
        .expect(&format!("Unable to parse {}", path))
    
}

#[tauri::command]
pub fn get_name_by_global_id(global_id: String) -> Result<String, &'static str> {

    let global_id = global_id.parse::<u64>().unwrap();
    let game_data = GAME_DATA.get().unwrap();

    let index = game_data.global_ids.iter().position(|&x| x == global_id);

    if index.is_none() {

        info!("No name found for global_id: {}", global_id);
        return Err("No name found");

    }

    Ok(game_data.names[index.unwrap()].clone())

}