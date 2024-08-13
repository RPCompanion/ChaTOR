
use std::sync::LazyLock;

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
    pub show_background_image: bool,

    #[serde(default = "default_show_page_header")]
    pub show_page_header: bool

}

pub const TAURI_CONFIG_FILE: &str = include_str!("../../../../tauri.conf.json");
pub static TAURI_WINDOW_SETTINGS: LazyLock<WidthHeight> = LazyLock::new(|| {
    
    let conf: serde_json::Value = serde_json::from_str(TAURI_CONFIG_FILE).unwrap();
    let windows = conf["tauri"]["windows"][0].clone();

    WidthHeight {
        width: windows["width"].as_i64().unwrap() as i32,
        height: windows["height"].as_i64().unwrap() as i32
    }

});

fn default_always_on_top() -> bool {
    false
}

fn default_show_window_decorations() -> bool {
    false
}

fn default_opacity() -> i32 {
    100
}

fn default_show_background_image() -> bool {
    false
}

fn default_show_page_header() -> bool {
    true
}

impl Default for AppSettings {

    fn default() -> AppSettings {


        AppSettings {

            window: *TAURI_WINDOW_SETTINGS,
            show_window_decorations: false,
            always_on_top: false,
            opacity: 100,
            show_background_image: false,
            show_page_header: true

        }

    }

}