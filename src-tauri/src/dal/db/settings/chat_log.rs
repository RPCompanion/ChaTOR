
use serde::{Deserialize, Serialize};

pub mod window;
pub mod chat_tab;

use window::ChatLogWindow;

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatLogSettings {

    #[serde(default = "default_capture_chat_log")]
    pub capture_chat_log: bool,
    #[serde(default = "default_log_global_chat")]
    pub log_global_chat: bool,
    #[serde(default = "default_retry_message_submission")]
    pub retry_message_submission: bool,
    /// Let the DLL find hook targets by scanning the game image instead of
    /// relying solely on the offset table.
    #[serde(default = "default_dynamic_offset_lookup")]
    pub dynamic_offset_lookup: bool,
    pub character_ini_to_pull_from: Option<String>,

    #[serde(default = "ChatLogWindow::default")]
    pub window: ChatLogWindow

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

pub fn default_dynamic_offset_lookup() -> bool {
    true
}

impl Default for ChatLogSettings {
    
    fn default() -> ChatLogSettings {

        ChatLogSettings {
            capture_chat_log: false,
            log_global_chat: false,
            retry_message_submission: false,
            dynamic_offset_lookup: true,
            character_ini_to_pull_from: None,
            window: window::ChatLogWindow::default()
        }

    }

}