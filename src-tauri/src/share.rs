
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub enum MessageType {
    Info,
    Chat
}

#[derive(Deserialize, Serialize)]
pub struct RawSwtorMessage {
    pub message_type: MessageType,
    pub message: String
}

impl RawSwtorMessage {

    pub fn new(message_type: MessageType, message: String) -> RawSwtorMessage {
        RawSwtorMessage { message_type, message}
    }

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

}