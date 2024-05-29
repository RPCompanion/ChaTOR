
use serde::{Deserialize, Serialize};

use crate::dal::db::settings::dimensions::WidthHeight;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub window: WidthHeight,     
}

const TAURI_CONFIG_FILE: &str = include_str!("../../../../tauri.conf.json");

impl AppSettings {

    pub fn default() -> AppSettings {

        let conf: serde_json::Value = serde_json::from_str(TAURI_CONFIG_FILE).unwrap();
        let windows = conf["tauri"]["windows"][0].clone();

        AppSettings {

            window: WidthHeight {
                width: windows["width"].as_i64().unwrap() as i32,
                height: windows["height"].as_i64().unwrap() as i32
            }

        }

    }

}