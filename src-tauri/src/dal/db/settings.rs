
use rusqlite::params;
use serde::{Deserialize, Serialize};

use super::get_connection;

pub mod chat_settings;
pub mod chat_log;

use chat_settings::ChatSettings;
use chat_log::ChatLogSettings;


#[derive(Deserialize, Serialize)]
pub struct Settings {
    pub chat: ChatSettings,
    #[serde(default = "default_chat_log_settings")]
    pub chat_log: ChatLogSettings
}

fn default_chat_log_settings() -> ChatLogSettings {
    ChatLogSettings::default()
}

impl Settings {

    pub fn default() -> Settings {

        Settings {
            chat: ChatSettings::default(),
            chat_log: ChatLogSettings::default()
        }

    }

    pub fn get() -> Settings {

        let conn = get_connection();
        let response = conn.query_row("SELECT settings FROM Settings LIMIT 1", params![], |row| {

            let settings: Settings = serde_json::from_str(&row.get::<_, String>(0).unwrap()).unwrap();
            Ok(settings)

        });

        match response {
            Ok(settings) => settings,
            Err(_) => Settings::default()
        }

    }

    pub fn update(&self) {

        const UPDATE_QUERY: &str = 
        "
            INSERT INTO 
                Settings (settings_id, settings)
            VALUES 
                (1, ?1)
            ON CONFLICT(settings_id) 
            DO 
                UPDATE 
                SET settings = ?1;
        ";

        let conn = get_connection();
        conn.execute(UPDATE_QUERY, params![serde_json::to_string(self).unwrap()]).unwrap();

    }

}

#[tauri::command]
pub fn get_settings() -> Settings {
    Settings::get()
}

#[tauri::command]
pub fn update_settings(settings: Settings) {
    settings.update();
}