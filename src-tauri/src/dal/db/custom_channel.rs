
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::dal::db::get_connection;

#[derive(Deserialize, Serialize)]
pub struct CustomChannel {
    custom_channel_id: Option<i32>,
    channel_name: String,
    channel_number: i32
}

impl CustomChannel {

    pub fn get_all() -> Vec<CustomChannel> {

        let conn = get_connection();
        const QUERY: &str = 
        "
            SELECT 
                custom_channel_id, 
                channel_name, 
                channel_number
            FROM 
                CustomChannel;
        ";
        let mut stmt = conn.prepare(QUERY).unwrap();
        let rows = stmt.query_map([], |row| {
            Ok(CustomChannel {
                custom_channel_id: row.get(0)?,
                channel_name: row.get(1)?,
                channel_number: row.get(2)?
            })
        }).unwrap();

        let mut custom_channels = Vec::new();
        for row in rows {
            custom_channels.push(row.unwrap());
        }

        return custom_channels

    }

    pub fn save(&self) -> Result<(), rusqlite::Error> {

        if let Some(_) = self.custom_channel_id {
            return self.update();
        }

        let conn = get_connection();
        const QUERY: &str = 
        "
            INSERT INTO 
                CustomChannel (channel_name, channel_number)
            VALUES 
                (?, ?);
        ";
        conn.execute(QUERY, params![self.channel_name, self.channel_number])?;
        return Ok(())

    }

    fn update(&self) -> Result<(), rusqlite::Error> {

        let conn = get_connection();
        const QUERY: &str =
        "
            UPDATE 
                CustomChannel
            SET 
                channel_name = ?,
                channel_number = ?
            WHERE 
                custom_channel_id = ?;
        ";

        conn.execute(QUERY, params![self.channel_name, self.channel_number, self.custom_channel_id])?;
        return Ok(())

    }

    pub fn delete(&self) -> Result<(), rusqlite::Error> {

        assert!(self.custom_channel_id.is_some());

        let conn = get_connection();
        const QUERY: &str =
        "
            DELETE FROM 
                CustomChannel
            WHERE 
                custom_channel_id = ?;
        ";

        conn.execute(QUERY, params![self.custom_channel_id])?;
        return Ok(())

    }

}

#[tauri::command]
pub fn get_all_custom_channels() -> Vec<CustomChannel> {

    CustomChannel::get_all()

}

#[tauri::command]
pub fn save_custom_channel(custom_channel: CustomChannel) -> Result<(), &'static str> {

    custom_channel.save().map_err(|_| "Unable to save emote")

}

#[tauri::command]
pub fn delete_custom_channel(custom_channel: CustomChannel) -> Result<(), &'static str> {

    custom_channel.delete().map_err(|_| "Unable to delete emote")

}