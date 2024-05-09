
use rusqlite::params;
use serde::{Deserialize, Serialize};
use crate::dal::db;

use super::get_connection;

#[derive(Deserialize, Serialize)]
pub struct ChatSettings {
    pub confirmation_before_posting: bool,
    pub enter_to_send: bool
}

impl ChatSettings {

    pub fn default() -> ChatSettings {

        ChatSettings {
            confirmation_before_posting: true,
            enter_to_send: false
        }

    }

}

#[derive(Deserialize, Serialize)]
pub struct Settings {
    pub chat: ChatSettings
}

impl Settings {

    pub fn default() -> Settings {

        Settings {
            chat: ChatSettings::default()
        }

    }

    pub fn get() -> Settings {

        let conn = get_connection();
        let response = conn.query_row("SELECT settings FROM Settings LIMIT 1", params![], |row| {

            let chat: ChatSettings = serde_json::from_str(&row.get::<_, String>(0).unwrap()).unwrap();
            Ok(Settings {
                chat
            })

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