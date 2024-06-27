
use serde::{Deserialize, Serialize};

use crate::swtor::SwtorChannel;

#[derive(Deserialize, Serialize, Clone)]
pub enum ChannelDispatcher {
    RegularDispatch(i32),
    CustomDispatch(String)
}

#[derive(Deserialize, Serialize, Clone)]
pub struct ChatTab {
    pub name: String,
    pub channels: Vec<ChannelDispatcher>,
    pub default_channel: Option<ChannelDispatcher>
}

impl ChatTab {

    pub fn default_tabs() -> Vec<ChatTab> {

        vec![
            ChatTab {
                name: "Global".to_string(),
                channels: vec![
                    ChannelDispatcher::RegularDispatch(SwtorChannel::GLOBAL as i32),
                    ChannelDispatcher::RegularDispatch(SwtorChannel::PVP as i32),
                    ChannelDispatcher::RegularDispatch(SwtorChannel::TRADE as i32)
                ],
                default_channel: Some(ChannelDispatcher::RegularDispatch(SwtorChannel::GLOBAL as i32))
            },
            ChatTab {
                name: "Local".to_string(),
                channels: vec![
                    ChannelDispatcher::RegularDispatch(SwtorChannel::EMOTE as i32), 
                    ChannelDispatcher::RegularDispatch(SwtorChannel::SAY as i32), 
                    ChannelDispatcher::RegularDispatch(SwtorChannel::YELL as i32), 
                    ChannelDispatcher::RegularDispatch(SwtorChannel::WHISPER as i32)
                ],
                default_channel: None
            }
        ]

    } 

}