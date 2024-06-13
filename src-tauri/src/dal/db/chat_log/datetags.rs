
use rusqlite::params;
use serde::{Serialize, Deserialize};

use crate::dal::db;

#[derive(Serialize, Deserialize)]
pub struct DateTag {
    pub date: String,
    pub favourite: bool,
    pub tags: Vec<String>
}

impl DateTag {

    pub fn get_all_favourites() -> Result<Vec<DateTag>, &'static str> {

        let conn = db::get_connection();
        const QUERY: &str = 
        "
            SELECT
                timestamp,
                favourite,
                tags
            FROM
                ChatLog_DateTags
            WHERE
                favourite = TRUE
            ORDER BY timestamp ASC;
        ";

        let mut stmt = conn.prepare(QUERY).unwrap();
        let message_iter = stmt.query_map([], |row| {

            let tags_str: String  = row.get(2)?;
            let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap();
            Ok(DateTag {
                date: row.get(0)?,
                favourite: row.get(1)?,
                tags
            })

        }).map_err(|_| "Error getting all date tag favourites")?;

        Ok(message_iter.map(|m| m.unwrap()).collect())

    }

    pub fn save(&self) -> Result<(), &'static str> {

        let conn = db::get_connection();
        const INSERT_QUERY: &str = 
        "
            INSERT INTO ChatLog_DateTags (timestamp,favourite, tags)
            VALUES
            (?1, ?2, ?3)
            ON CONFLICT(timestamp)
            DO UPDATE SET
                favourite = excluded.favourite,
                tags      = excluded.tags;
        ";

        conn.execute(INSERT_QUERY, params![self.date, self.favourite, serde_json::to_string(&self.tags).unwrap()])
            .map_err(|_| "Error saving date tag")?;

        Ok(())

    }

}

#[tauri::command]
pub fn get_all_date_tag_favourites() -> Result<Vec<DateTag>, &'static str> {
    DateTag::get_all_favourites()
}

#[tauri::command]
pub fn save_date_tag(date_tag: DateTag) -> Result<(), &'static str> {
    date_tag.save()
}