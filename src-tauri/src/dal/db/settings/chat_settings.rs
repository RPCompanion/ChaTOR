
use serde::{Deserialize, Serialize};

pub mod chat_tab;

use self::chat_tab::ChatTab;

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatSettings {

    #[serde(default = "default_confirmation_before_posting")]
    pub confirmation_before_posting: bool,

    #[serde(default = "default_enter_to_post")]
    pub enter_to_post: bool,

    #[serde(default = "default_clear_chat_after_posting")]
    pub clear_chat_after_posting: bool,

    #[serde(default = "default_remove_starting_pronouns")]
    pub remove_starting_pronouns: bool,

    #[serde(default = "default_starting_characters_are_lowercase")]
    pub starting_characters_are_lowercase: bool,

    #[serde(default = "default_capture_chat_log")]
    pub capture_chat_log: bool,

    #[serde(default = "default_show_chat_log_window")]
    pub show_chat_log_window: bool,

    #[serde(default = "default_retry_message_submission")]
    pub retry_message_submission: bool,

    #[serde(default = "ChatTab::default_tabs")]
    pub chat_tabs: Vec<ChatTab>
    
}

pub fn default_confirmation_before_posting() -> bool {
    true
}

pub fn default_enter_to_post() -> bool {
    false
}

pub fn default_clear_chat_after_posting() -> bool {
    false
}

pub fn default_remove_starting_pronouns() -> bool {
    false
}

pub fn default_starting_characters_are_lowercase() -> bool {
    true
}

pub fn default_capture_chat_log() -> bool {
    false
}

pub fn default_show_chat_log_window() -> bool {
    false
}

pub fn default_retry_message_submission() -> bool {
    false
}


impl ChatSettings {

    pub fn default() -> ChatSettings {

        ChatSettings {
            confirmation_before_posting: true,
            enter_to_post: false,
            clear_chat_after_posting: false,
            remove_starting_pronouns: false,
            starting_characters_are_lowercase: true,
            capture_chat_log: false,
            show_chat_log_window: false,
            retry_message_submission: false,
            chat_tabs: ChatTab::default_tabs()
        }

    }

}