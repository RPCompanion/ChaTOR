
use crate::share::*;
use crate::utils::StringUtils;

use crate::capture_injector::swtor_message::SwtorMessage;

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

        match SwtorMessage::from(message.message) {
            Ok(swtor_message) => {
                self.unstored_messages.push(swtor_message);
            },
            Err(_) => {}
        }

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