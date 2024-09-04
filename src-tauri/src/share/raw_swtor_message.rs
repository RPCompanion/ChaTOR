
use std::ffi::CStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::AsJson;

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

    pub fn from_raw_ptrs(channel_id: i32, from: *const *const i8, to: *const *const i8, chat_message: *const *const i8) -> Result<RawSwtorMessage, &'static str> {

        let converter = |ptr: *const *const i8| -> Result<String, &'static str> {

            unsafe {
                Ok(CStr::from_ptr(*ptr)
                    .to_str()
                    .map_err(|_| "Failed to convert")?
                    .to_string())
            }

        };

        let t_from         = converter(from)?;
        let t_to           = converter(to)?;
        let t_chat_message = converter(chat_message)?;

        Ok(RawSwtorMessage::new(channel_id, t_from, t_to, t_chat_message))

    }

}

impl AsJson for RawSwtorMessage {}