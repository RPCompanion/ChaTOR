
use std::sync::OnceLock;

use tracing::info;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub crash_reporter_url: String,
    pub microsoft_webview2_url: String
}

static CONFIG: OnceLock<Config> = OnceLock::new();

impl Config {

    pub fn new() -> Result<Self, String> {

        const PATH: &str = if cfg!(debug_assertions) {
            "dev-config.toml"
        } else {
            "config.toml"
        };

        match std::fs::read_to_string(PATH) {

            Ok(contents) => {

                let config = 
                    toml::from_str(&contents)
                        .map_err(|e| e.to_string())?;

                Ok(config)

            },
            Err(_) => Err("Error reading config file.".to_string())

        }

    }

}

pub fn init() -> Result<(), String> {

    if CONFIG.get().is_some() {

        info!("Config already initialized");
        return Ok(());

    }

    CONFIG
        .set(Config::new()?)
        .unwrap();

    Ok(())

}

pub fn config() -> &'static Config {

    CONFIG.get().unwrap()

}