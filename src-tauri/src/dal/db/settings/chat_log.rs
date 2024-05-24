
use serde::{Deserialize, Serialize};


#[derive(Deserialize, Serialize, Clone)]
pub struct ChatLogSettings {

    #[serde(default = "default_capture_chat_log")]
    pub capture_chat_log: bool,

    #[serde(default = "default_log_global_chat")]
    pub log_global_chat: bool,
    pub character_ini_to_pull_from: Option<String>

}

pub fn default_capture_chat_log() -> bool {
    false
}

pub fn default_log_global_chat() -> bool {
    false
}

impl ChatLogSettings {
    
    pub fn default() -> ChatLogSettings {

        ChatLogSettings {
            capture_chat_log: false,
            log_global_chat: false,
            character_ini_to_pull_from: None
        }

    }

}