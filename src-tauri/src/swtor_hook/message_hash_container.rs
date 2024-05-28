
use crate::swtor::SwtorChannel;

pub struct MessageHashContainer {
    pub channels: Vec<SwtorChannel>,
    pub message_hashes: Vec<u64>
}

impl MessageHashContainer {

    pub fn new() -> MessageHashContainer {
        MessageHashContainer {
            channels: Vec::new(),
            message_hashes: Vec::new()
        }
    }

    pub fn clear(&mut self) {
        self.channels.clear();
        self.message_hashes.clear();
    }

    pub fn push(&mut self, channel: SwtorChannel, message_hash: u64) {
        self.channels.push(channel);
        self.message_hashes.push(message_hash);
    }

}