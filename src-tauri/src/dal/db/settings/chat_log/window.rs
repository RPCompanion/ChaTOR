
use serde::{Deserialize, Serialize};

use crate::dal::db::settings::{
    chat_log::chat_tab::ChatTab, 
    dimensions::WidthHeight
};

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatLogWindow {

    /// Whether to prefetch hyperlinks in chat messages.
    #[serde(default = "default_prefetch_hyperlinks")]
    prefetch_hyperlinks: bool,

    #[serde(default = "default_show_chat_log_window")]
    show_chat_log_window: bool,

    #[serde(default = "ChatTab::default_tabs")]
    chat_tabs: Vec<ChatTab>,

    #[serde(default = "WidthHeight::default")]
    window: WidthHeight

}

const fn default_prefetch_hyperlinks() -> bool {
    false
}

const fn default_show_chat_log_window() -> bool {
    false
}

impl Default for ChatLogWindow {

    fn default() -> ChatLogWindow {

        ChatLogWindow {
            prefetch_hyperlinks: default_prefetch_hyperlinks(),
            show_chat_log_window: default_show_chat_log_window(),
            chat_tabs: ChatTab::default_tabs(),
            window: WidthHeight::default()
        }

    }

}