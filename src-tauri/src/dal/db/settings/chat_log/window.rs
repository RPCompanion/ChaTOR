
use serde::{Deserialize, Serialize};

use crate::dal::{colors::Color, db::settings::{
    chat_log::chat_tab::ChatTab, 
    dimensions::WidthHeight
}};

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
    window: WidthHeight,

    #[serde(default = "default_override_channel_colors")]
    override_channel_colors: bool,

    #[serde(default = "ChannelColors::default")]
    channel_colors: ChannelColors

}

const fn default_prefetch_hyperlinks() -> bool {
    false
}

const fn default_show_chat_log_window() -> bool {
    false
}

const fn default_override_channel_colors() -> bool {
    false
}

impl Default for ChatLogWindow {

    fn default() -> ChatLogWindow {

        ChatLogWindow {
            prefetch_hyperlinks: default_prefetch_hyperlinks(),
            show_chat_log_window: default_show_chat_log_window(),
            chat_tabs: ChatTab::default_tabs(),
            window: WidthHeight::default(),
            override_channel_colors: default_override_channel_colors(),
            channel_colors: ChannelColors::default()
        }

    }

}

#[derive(Deserialize, Serialize, Clone)]
pub struct ChannelColors {
    say: Color,
    yell: Color,
    emote: Color,
    whisper: Color,
    group: Color,
    guild: Color,
    ops: Color,
    ops_leader: Color
}

impl Default for ChannelColors {

    fn default() -> Self {
        
        ChannelColors {
            say: Color::new(179, 236, 254),
            yell: Color::new(255, 115, 255),
            emote: Color::new(255, 128, 34),
            whisper: Color::new(165, 159, 244),
            group: Color::new(29, 140, 254),
            guild: Color::new(130, 236, 137),
            ops: Color::new(239, 188, 85),
            ops_leader: Color::new(255, 84, 0)
        }

    }

}