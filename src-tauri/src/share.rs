
use raw_swtor_message::RawSwtorMessage;
use serde::{Deserialize, Serialize};

pub mod raw_swtor_message;

#[derive(Deserialize, Serialize)]
pub enum CaptureMessage {
    Info(String),
    CaptureError(String),
    Panic(String),
    Chat(RawSwtorMessage)
}

impl CaptureMessage {

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

}