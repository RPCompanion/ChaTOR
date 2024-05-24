
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::dal::db;

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomEmote {
    pub custom_emote_id: i32,
    pub emote_name: String,
    pub emote: String
}

impl CustomEmote {

    pub fn new(emote_name: String, emote: String) -> Result<CustomEmote, &'static str> {

        if emote_name.is_empty() {
            return Err("Emote name cannot be empty");
        }

        if emote.is_empty() {
            return Err("Emote cannot be empty");
        }

        if emote.len() > 255 {
            return Err("Emote cannot be longer than 255 characters");
        }

        let conn = db::get_connection();
        const INSERT_QUERY: &str = 
        "  
            INSERT INTO CustomEmotes (emote_name, emote)
            VALUES (?1, ?2)
            RETURNING custom_emote_id;
        ";

        let response = conn.query_row(INSERT_QUERY, params![&emote_name, &emote], |row| { 

            match row.get(0) { 
                Ok(custom_emote_id) => Ok(custom_emote_id),
                Err(err) => Err(err)
            }

        });


        match response {
            Ok(custom_emote_id) => Ok(CustomEmote {
                custom_emote_id,
                emote_name,
                emote
            }),
            Err(_) => Err("Error inserting custom emote")
        }

    }

    pub fn get_all() -> Result<Vec<CustomEmote>, &'static str> {

        let conn = db::get_connection();
        const SELECT_QUERY: &str = 
        "
            SELECT 
                custom_emote_id, emote_name, emote
            FROM 
                CustomEmotes;
        ";

        let mut stmt = conn.prepare(SELECT_QUERY).unwrap();
        let custom_emotes = stmt.query_map(params![], |row| {

            Ok(CustomEmote {
                custom_emote_id: row.get(0)?,
                emote_name: row.get(1)?,
                emote: row.get(2)?
            })

        });

        match custom_emotes {
            Ok(custom_emotes) => {

                let mut custom_emotes_vec = Vec::new();
                for custom_emote in custom_emotes {
                    custom_emotes_vec.push(custom_emote.unwrap());
                }

                Ok(custom_emotes_vec)

            },
            Err(_) => Err("Error getting custom emotes")
        }

    }

    pub fn delete_emote(custom_emote_id: i32) {

        let conn = db::get_connection();
        const DELETE_QUERY: &str = 
        "
            DELETE FROM 
                CustomEmotes
            WHERE 
                custom_emote_id = ?;
        ";

        conn.execute(DELETE_QUERY, params![custom_emote_id]).unwrap();

    }

    pub fn save(&self) -> Result<(), String> {
            
        let conn = db::get_connection();
        const UPDATE_QUERY: &str = 
        "
            UPDATE 
                CustomEmotes
            SET 
                emote_name = ?1, emote = ?2
            WHERE 
                custom_emote_id = ?3;
        ";

        match conn.execute(UPDATE_QUERY, params![&self.emote_name, &self.emote, self.custom_emote_id]) {
            Ok(_) => {},
            Err(e) => {
                println!("{:?}", e);
                return Err(e.to_string());
            }
        };

        return Ok(())
    
    }

}

#[tauri::command]
pub fn get_all_custom_emotes() -> Result<Vec<CustomEmote>, &'static str> {

    CustomEmote::get_all()

}

#[tauri::command]
pub fn create_custom_emote(emote_name: String, emote: String) -> Result<CustomEmote, &'static str> {

    CustomEmote::new(emote_name, emote)

}

#[tauri::command]
pub fn delete_custom_emote(custom_emote_id: i32) {

    CustomEmote::delete_emote(custom_emote_id)

}

#[tauri::command]
pub fn update_custom_emote(custom_emote: CustomEmote) -> Result<(), String> {

    custom_emote.save()

}