
use crate::share::*;
use crate::swtor_hook::push_incoming_message_hash;
use crate::utils::StringUtils;

use crate::capture_injector::swtor_message::SwtorMessage;

pub struct MessageContainer {
    pub unstored_messages: Vec<SwtorMessage>
}

impl MessageContainer {

    pub fn new() -> MessageContainer {

        MessageContainer {
            unstored_messages: Vec::new()
        }

    }

    pub fn push(&mut self, message: RawSwtorMessage) {

        match message.message_type {
            MessageType::Info => { return; },
            _ => {}
        }

        let swtor_message: SwtorMessage = serde_json::from_str(&message.message).unwrap();
        push_incoming_message_hash(swtor_message.message.as_u64_hash());
        self.unstored_messages.push(swtor_message);

    }

    pub fn drain_unstored(&mut self) -> Vec<SwtorMessage> {

        self.unstored_messages
            .drain(..)
            .collect()

    }

}