

use regex::Regex;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use crate::dal::db;
use crate::dal::db::log::log_error;
use crate::utils::StringUtils;

pub struct CommandMessage {
    pub command: Option<String>,
    pub message: String
}

impl CommandMessage {
    
    pub fn new(command: Option<String>, message: String) -> Self {

        Self {
            command,
            message
        }

    }

    pub fn concat(&self) -> String {
            
        if self.command.is_none() {
            return self.message.clone();
        }

        format!("{:?} {:?}", self.command.as_ref().unwrap(), self.message)
        
    }

}

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

    pub fn prepare_messages(&mut self) {

        self.messages.iter_mut().for_each(|message| {

            *message = message
                .replace("ChatGPT", "")
                .replace("”", "\"");    

        });

    }

    pub fn get_all_command_message_splits(&self) -> Result<Vec<CommandMessage>, &'static str> {

        let mut c_and_m: Vec<CommandMessage> = Vec::new();

        for message in self.messages.iter() {
            c_and_m.push(self.get_command_message_split(message)?);
        }
    
        Ok(c_and_m)

    }

    fn get_command_message_split(&self, message: &str) -> Result<CommandMessage, &'static str> {

        if !message.starts_with("/") {
            return Ok(CommandMessage::new(None, message.to_string()));
        }

        let whisper_re = Regex::new(r"(\/w\s+|\/whisper\s+)([^:]+):").unwrap();
        let whispers: Vec<&str> = whisper_re.captures_iter(message).map(|c| c.get(0).unwrap().as_str()).collect();

        if whispers.len() > 1 {

            return Err("Must have one whisper in a message");

        } else if whispers.len() == 1 {

            let whisper = whispers[0];
            return Ok(CommandMessage::new(Some(whisper.to_string()), message.replace(whisper, "").trim().to_string()));

        }

        // No whisper was captured, so it must be a simple command
        let simple_re = Regex::new(r"^\/([a-z]+)\s").unwrap();
        let simple_command = simple_re.captures(message).unwrap().get(0).unwrap().as_str();

        return Ok(CommandMessage::new(Some(simple_command.to_string()), message.replace(simple_command, "").trim().to_string()));

    }

}
