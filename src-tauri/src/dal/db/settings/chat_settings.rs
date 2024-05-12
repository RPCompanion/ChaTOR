
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
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
    pub capture_chat_log: bool
    
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

impl ChatSettings {

    pub fn default() -> ChatSettings {

        ChatSettings {
            confirmation_before_posting: true,
            enter_to_post: false,
            clear_chat_after_posting: false,
            remove_starting_pronouns: false,
            starting_characters_are_lowercase: true,
            capture_chat_log: false
        }

    }

}