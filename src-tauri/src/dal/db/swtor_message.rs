
use chrono::prelude::*;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use crate::swtor::SwtorChannel;
use crate::utils::StringUtils;

use crate::dal::db::{self, settings};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SwtorMessage {
    pub channel: i32,
    #[serde(default = "default_timestamp")]
    pub timestamp: DateTime<Utc>,
    pub from: String,
    pub to: String,
    pub message: String,
    
}

fn default_timestamp() -> DateTime<Utc> {
    Utc::now()
}

impl SwtorMessage {

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

    pub fn as_u64_hash(&self) -> u64 {
        self.as_json_str().as_u64_hash()
    }

    pub fn get_parsed_message(&self) -> String {

        self.message
            .replace("&quot;", "\"")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&apos;", "'")

    }

    pub fn save_messages_to_db(messages: Vec<SwtorMessage>) {

        let conn = db::get_connection();

        const INSERT_PLAYER: &str = 
        "
            INSERT OR IGNORE INTO 
                Characters (character_name)
            SELECT
                ?1
            WHERE NOT EXISTS (SELECT 1 FROM Characters WHERE character_name = ?1);
        ";

        let mut stmt = conn.prepare(INSERT_PLAYER).unwrap();
        for message in messages.iter() {

            match stmt.execute(&[&message.from]) {
                Ok(_) => {},
                Err(_err) => {}
            }

        }

        let save_global_msgs: bool = settings::get_settings().chat_log.log_global_chat;

        const INSERT_MESSAGE: &str = 
        "
            INSERT OR IGNORE INTO 
                ChatLog (chat_hash, character_id, message)
            SELECT
                ?1,
                C.character_id,
                ?2
            FROM
                Characters C
            WHERE
                ?2->>'from' = C.character_name;
        ";
        
        let mut stmt = conn.prepare(INSERT_MESSAGE).unwrap();
        for message in messages.iter() {

            if !save_global_msgs {

                if !SwtorMessage::should_log_channel_message(message.channel) {
                    continue;
                }

            }

            match stmt.execute(params![message.as_u64_hash() as i64, &message.as_json_str()]) {
                Ok(_) => {},
                Err(_err) => {
                    println!("Error inserting message {}", _err);
                }
            }

        }

    }

    fn should_log_channel_message(channel: i32) -> bool {

        let t_channel = SwtorChannel::try_from(channel);
        if t_channel.is_err() {
            println!("Error converting channel {}", channel);
            return true;
        } 

        match t_channel.unwrap() {
            SwtorChannel::GLOBAL => false,
            SwtorChannel::PVP => false,
            SwtorChannel::TRADE => false,
            _ => true
        }

    }

}