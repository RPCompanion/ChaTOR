
use serde::{Deserialize, Serialize};

use crate::swtor::SwtorChannel;

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatTab {
    pub name: String,
    pub channels: Vec<i32>
}

impl ChatTab {

    pub fn default_tabs() -> Vec<ChatTab> {

        vec![
            ChatTab {
                name: "Global".to_string(),
                channels: vec![
                    SwtorChannel::GLOBAL as i32,
                    SwtorChannel::PVP as i32,
                    SwtorChannel::TRADE as i32
                ]
            },
            ChatTab {
                name: "Local".to_string(),
                channels: vec![
                    SwtorChannel::EMOTE as i32, 
                    SwtorChannel::SAY as i32, 
                    SwtorChannel::YELL as i32, 
                    SwtorChannel::WHISPER as i32
                ]
            }
        ]

    } 

}