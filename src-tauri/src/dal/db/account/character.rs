
use rusqlite::params;
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use tracing::error;

use crate::dal::db;

#[derive(Serialize, Deserialize)]
pub struct Character {
    pub character_sheet: serde_json::Value,
    pub public_id: Uuid,
    // Server primary keys
    pub template_id: i32,
    pub server_id: i32
}

impl Character {

    pub fn fetch_all() -> Result<Vec<Character>, &'static str> {

        let conn = db::get_connection();

        const QUERY: &str = 
        "
            SELECT
                character_sheet,
                public_id,
                template_id,
                server_id
            FROM
                Account_Characters
        ";

        let mut stmt = conn.prepare(QUERY).unwrap();
        let rows = stmt.query_map(params![], |row| {

            Ok(Character {
                character_sheet: serde_json::from_str(&row.get::<_, String>(0)?).unwrap(),
                public_id: row.get(1)?,
                template_id: row.get(2)?,
                server_id: row.get(3)?
            })

        }).map_err(|_| "Error fetching characters")?;
        Ok(rows.map(|r| r.unwrap()).collect())

    }

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

#[tauri::command]
pub fn fetch_all_characters() -> Result<Vec<Character>, &'static str> {
    Character::fetch_all()
}