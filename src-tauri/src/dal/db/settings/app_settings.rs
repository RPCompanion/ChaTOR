
use serde::{Deserialize, Serialize};

use crate::dal::db::settings::dimensions::WidthHeight;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {

    pub window: WidthHeight,
    #[serde(default = "default_always_on_top")]
    pub always_on_top: bool,

    #[serde(default = "default_show_window_decorations")]
    pub show_window_decorations: bool,

    #[serde(default = "default_opacity")]
    pub opacity: i32,

    #[serde(default = "default_show_background_image")]
    pub show_background_image: bool

}

const TAURI_CONFIG_FILE: &str = include_str!("../../../../tauri.conf.json");

fn default_always_on_top() -> bool {
    false
}

fn default_show_window_decorations() -> bool {
    true
}

fn default_opacity() -> i32 {
    100
}

fn default_show_background_image() -> bool {
    true
}

impl AppSettings {

    pub fn default() -> AppSettings {

        let conf: serde_json::Value = serde_json::from_str(TAURI_CONFIG_FILE).unwrap();
        let windows = conf["tauri"]["windows"][0].clone();

        AppSettings {

            window: WidthHeight {
                width: windows["width"].as_i64().unwrap() as i32,
                height: windows["height"].as_i64().unwrap() as i32
            },
            show_window_decorations: true,
            always_on_top: false,
            opacity: 100,
            show_background_image: true

        }

    }

}