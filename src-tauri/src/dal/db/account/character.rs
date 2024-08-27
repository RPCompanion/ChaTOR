
use rusqlite::params;
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use tracing::error;

use crate::dal::db;

#[derive(Serialize, Deserialize)]
pub struct Character {
    pub character_sheet: serde_json::Value,
    pub public_id: Uuid
}

impl Character {

    pub fn save(&self) -> Result<(), &'static str> {

        let conn = db::get_connection();

        const QUERY: &str =
        "
            INSERT INTO 
                Account_Characters (character_sheet, public_id)
            VALUES
                (?1, ?2)
            ON CONFLICT(public_id) DO UPDATE SET
                character_sheet = ?1;
        ";

        if let Err(e) = conn.execute(QUERY, params![self.character_sheet, self.public_id]) {
            error!("Error saving character: {:?}", e);
            return Err("Error saving character");
        }

        return Ok(());

    }

}

#[tauri::command]
pub fn save_character(character: Character) -> Result<(), &'static str> {

    character.save()

}