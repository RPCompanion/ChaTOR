
use serde::{Deserialize, Serialize};

pub mod window;
pub mod chat_tab;

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatLogSettings {

    #[serde(default = "default_capture_chat_log")]
    pub capture_chat_log: bool,
    #[serde(default = "default_log_global_chat")]
    pub log_global_chat: bool,
    #[serde(default = "default_retry_message_submission")]
    pub retry_message_submission: bool,
    pub character_ini_to_pull_from: Option<String>,

    #[serde(default = "window::ChatLogWindow::default")]
    pub window: window::ChatLogWindow

}

pub fn default_capture_chat_log() -> bool {
    false
}

pub fn default_retry_message_submission() -> bool {
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
            retry_message_submission: false,
            character_ini_to_pull_from: None,
            window: window::ChatLogWindow::default()
        }

    }

}