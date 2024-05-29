
use serde::{Deserialize, Serialize};

use crate::dal::db::settings::{
    chat_log::chat_tab::ChatTab, 
    dimensions::WidthHeight
};

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatLogWindow {

    #[serde(default = "default_show_unknown_ids")]
    show_unknown_ids: bool,
    #[serde(default = "default_show_chat_log_window")]
    show_chat_log_window: bool,
    #[serde(default = "ChatTab::default_tabs")]
    chat_tabs: Vec<ChatTab>,
    #[serde(default = "default_window")]
    window: WidthHeight

}

fn default_show_unknown_ids() -> bool {
    false
}

fn default_show_chat_log_window() -> bool {
    false
}

fn default_window() -> WidthHeight {
    WidthHeight {
        width: 0,
        height: 176
    }
}

impl ChatLogWindow {

    pub fn default() -> ChatLogWindow {

        ChatLogWindow {
            show_unknown_ids: false,
            show_chat_log_window: false,
            chat_tabs: ChatTab::default_tabs(),
            window: WidthHeight {
                width: 0,
                height: 176
            }
        }

    }

}