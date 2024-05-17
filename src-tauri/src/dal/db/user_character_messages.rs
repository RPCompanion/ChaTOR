

use rusqlite::params;
use serde::{Deserialize, Serialize};
use crate::dal::db;
use crate::dal::db::log::log_error;
use crate::utils::StringUtils;

#[derive(Deserialize, Serialize)]
pub enum MessageType {
    ButtonEmote,
    ChatMessage
}

#[derive(Deserialize, Serialize)]
pub struct UserCharacterMessages {
    pub message_type: MessageType,
    pub character_id: Option<i32>,
    pub messages: Vec<String>
}

impl UserCharacterMessages {

    pub fn store(&self) {

        let conn = db::get_connection();
        const INSERT_MESSAGE: &str = 
        "
            INSERT INTO 
                UsersChatLog (chat_hash, message)
            VALUES (?1, ?2)
            RETURNING my_chat_log_id;
        ";

        const INSERT_CHAT_LOG_CHARACTER: &str = 
        "
            INSERT INTO
                UsersChatLogCharacter (my_chat_log_id, character_id)
            VALUES (?1, ?2);
        ";

        for message in self.messages.iter() {

            let response = conn.query_row(INSERT_MESSAGE, params![message.as_u64_hash() as i64, &message], |row| {

                let my_chat_log_id: i32 = row.get(0).unwrap();
                Ok(my_chat_log_id)

            });

            if response.is_err() {
                log_error(format!("UserCharacterMessages::new() - Error inserting message {:?}", response.err()).as_str());
                continue;
            }

            if self.character_id.is_none() {
                continue;
            }

            if let Ok(my_chat_log_id) = response {
                conn.execute(INSERT_CHAT_LOG_CHARACTER, params![my_chat_log_id, self.character_id.unwrap()])
                    .unwrap();
            }

        }
        
    }

}
