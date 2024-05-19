
use crate::share::*;
use crate::utils::StringUtils;

use crate::capture_injector::swtor_message::SwtorMessage;
use crate::dal::db::chat_log::ChatLog;

pub struct MessageContainer {
    pub hashes: Vec<u64>,
    pub unstored_messages: Vec<SwtorMessage>
}

impl MessageContainer {

    pub fn new() -> MessageContainer {

        MessageContainer {
            hashes: Vec::new(),
            unstored_messages: Vec::new()
        }

    }

    pub fn push(&mut self, message: RawSwtorMessage) {

        match message.message_type {
            MessageType::Info => { return; },
            _ => {}
        }

        let hash = message.message.as_str().as_u64_hash();
        if !self.unique(hash) {
            return;
        }

        self.hashes.push(hash);
        self.unstored_messages.push(serde_json::from_str(&message.message).unwrap());

    }

    pub fn drain_unstored(&mut self) -> Vec<SwtorMessage> {

        self.unstored_messages
            .drain(..)
            .rev()
            .collect()

    }

    fn unique(&self, hash: u64) -> bool {

        !self.hashes.contains(&hash)

    }

}