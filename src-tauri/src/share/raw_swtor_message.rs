
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct RawSwtorMessage {
    pub channel: i32,
    pub timestamp: DateTime<Utc>,
    pub from: String,
    pub to: String,
    pub message: String, 
}

impl RawSwtorMessage {
    
    pub fn new(channel: i32, from: String, to: String, message: String) -> RawSwtorMessage {

        RawSwtorMessage {
            channel, 
            timestamp: Utc::now(), 
            from, 
            to, 
            message 
        }

    }

    pub fn as_json_str(&self) -> String {    
        serde_json::to_string(self).unwrap()
    }

}