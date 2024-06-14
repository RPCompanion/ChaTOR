
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use crate::dal::db;
use rusqlite::Error;

use super::swtor_message::SwtorMessage;

pub mod datetags;

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub chat_log_id: i32,
    pub character_id: i32,
    pub timestamp: String,
    pub message: SwtorMessage
}

pub struct ChatLog {
    pub messages: Vec<Message>
}

impl ChatLog {

    pub fn from_today() -> ChatLog {

        let date: String = Utc::now()
            .date_naive()
            .to_string();

        ChatLog::from_date(date)

    }

    pub fn from_date(date: String) -> ChatLog {

        let conn = db::get_connection();
        const SELECT_MESSAGES: &str =
        "
            SELECT
                chat_log_id,
                character_id,
                datetime(timestamp, 'localtime'),
                message
            FROM
                ChatLog
            WHERE
                date(timestamp, 'localtime') = ?1
            ORDER BY chat_log_id ASC;
        ";

        let mut stmt = conn.prepare(SELECT_MESSAGES).unwrap();
        let message_iter = stmt.query_map([date], |row| {

            let raw_message: String = row.get(3)?;
            let message: SwtorMessage = serde_json::from_str(&raw_message)
                .map_err(|e| Error::ToSqlConversionFailure(Box::new(e)))?;

            Ok(Message {
                chat_log_id: row.get(0)?,
                character_id: row.get(1)?,
                timestamp: row.get(2)?,
                message
            })
        });

        ChatLog {
            messages: message_iter.unwrap().map(|m| m.unwrap()).collect()
        }

    }

    pub fn get_distinct_dates() -> Vec<String> {

        let conn = db::get_connection();
        const SELECT_DATES: &str = 
        "
            SELECT
                DISTINCT date(datetime(CL.timestamp, 'localtime'))
            FROM
                ChatLog CL
            ORDER BY CL.timestamp ASC;          
        ";
        let mut stmt = conn.prepare(SELECT_DATES).unwrap();
        let date_iter = stmt.query_map([], |row| {
            Ok(row.get(0)?)
        });

        date_iter.unwrap().map(|d| d.unwrap()).collect()

    }

}

#[tauri::command]
pub fn get_todays_chat_log() -> Vec<Message> {
    ChatLog::from_today().messages
}

#[tauri::command]
pub fn get_chat_log_from_date(date: String) -> Vec<Message> {
    ChatLog::from_date(date).messages
}

#[tauri::command]
pub fn get_distinct_dates() -> Vec<String> {
    ChatLog::get_distinct_dates()
}