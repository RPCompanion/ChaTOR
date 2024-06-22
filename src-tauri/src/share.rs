
use serde::{Deserialize, Serialize};

use crate::dal::db::swtor_message::SwtorMessage;

#[derive(Deserialize, Serialize)]
pub enum CaptureMessage {
    Info(String),
    CaptureError(String),
    Chat(SwtorMessage)
}

impl CaptureMessage {

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

}