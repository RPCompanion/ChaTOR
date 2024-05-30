
use serde::{Deserialize, Serialize};
use crate::dal::db;
use rusqlite::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub chat_log_id: i32,
    pub character_id: i32,
    pub timestamp: String,
    pub message: String
}

pub struct ChatLog {
    pub messages: Vec<Message>
}

impl ChatLog {

    pub fn default() -> ChatLog {

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
            ORDER BY chat_log_id ASC;
        ";

        let mut stmt = conn.prepare(SELECT_MESSAGES).unwrap();
        let message_iter = stmt.query_map([], |row| {
            Ok(Message {
                chat_log_id: row.get(0)?,
                character_id: row.get(1)?,
                timestamp: row.get(2)?,
                message: row.get(3)?
            })
        });

        ChatLog {
            messages: message_iter.unwrap().map(|m| m.unwrap()).collect()
        }

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
            Ok(Message {
                chat_log_id: row.get(0)?,
                character_id: row.get(1)?,
                timestamp: row.get(2)?,
                message: row.get(3)?
            })
        });

        ChatLog {
            messages: message_iter.unwrap().map(|m| m.unwrap()).collect()
        }

    }

    pub fn get_todays_hashes() -> Vec<u64> {

        let conn = db::get_connection();
        const SELECT_MESSAGES: &str = 
        "
            SELECT
                chat_hash
            FROM
                ChatLog
            WHERE
                date(timestamp, 'localtime') = date('now', 'localtime');
        ";

        let mut stmt = conn.prepare(SELECT_MESSAGES).unwrap();
        let message_iter = stmt.query_map([], |row| {
            Ok(row.get(0)?)
        });

        message_iter.unwrap().map(|m: Result<i64, Error>| m.unwrap() as u64).collect()

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
pub fn get_chat_log_from_date(date: String) -> Vec<Message> {
    ChatLog::from_date(date).messages
}

#[tauri::command]
pub fn get_distinct_dates() -> Vec<String> {
    ChatLog::get_distinct_dates()
}