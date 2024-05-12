
use crate::share::*;
use crate::utils::StringUtils;

pub struct MessageContainer {
    pub hashes: Vec<u64>,
    pub unstored_messages: Vec<String>
}

impl MessageContainer {

    pub fn new() -> MessageContainer {

        MessageContainer {
            hashes: Vec::new(),
            unstored_messages: Vec::new()
        }

    }

    pub fn push(&mut self, message: Message) {

        match message.message_type {
            MessageType::Info => { return; },
            _ => {}
        }

        let hash = message.message.as_str().as_u64_hash();
        if !self.unique(hash) {
            return;
        }

        if self.relevant_message(&message) {

            self.hashes.push(hash);
            self.unstored_messages.push(message.message);

        }

    }

    pub fn drain_unstored(&mut self) -> Vec<String> {

        self.unstored_messages.drain(..).collect()

    }

    fn unique(&self, hash: u64) -> bool {

        !self.hashes.contains(&hash)

    }

    fn relevant_message(&self, message: &Message) -> bool {

        todo!("Need to determine how this message is relevant");

    }

}