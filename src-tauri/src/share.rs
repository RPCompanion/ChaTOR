
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

impl AsJson for CaptureMessage {}

pub trait AsJson {

    fn as_json(&self) -> String where Self: serde::ser::Serialize {
        serde_json::to_string(self).unwrap()
    }

}