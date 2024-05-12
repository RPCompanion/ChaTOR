
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub enum MessageType {
    Info,
    Chat
}

#[derive(Deserialize, Serialize)]
pub struct Message {
    pub message_type: MessageType,
    pub message: String
}