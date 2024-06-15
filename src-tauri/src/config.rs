
use std::sync::OnceLock;

use tracing::info;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    pub crash_reporter_url: String
}

static CONFIG: OnceLock<Config> = OnceLock::new();

impl Config {

    pub fn new() -> Result<Self, &'static str> {

        const PATH: &str = "config.toml";
        match std::fs::read_to_string(PATH) {

            Ok(contents) => Ok(toml::from_str(&contents).unwrap()),
            Err(_) => Err("Error reading config file.")

        }

    }

}

pub fn init() -> Result<(), &'static str> {

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