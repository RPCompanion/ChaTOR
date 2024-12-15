
use std::mem;
use std::ffi::CStr;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use thiserror::Error;

use super::AsJson;

#[derive(Deserialize, Serialize, Debug)]
pub struct RawSwtorMessage {
    pub channel: i32,
    pub timestamp: DateTime<Utc>,
    pub from: String,
    pub to: String,
    pub message: String, 
}

enum StrConversion {
    FromMessage,
    ToMessage,
    ChatMessage
}

#[derive(Error, Debug)]
pub enum RawStrConversionError {

    #[error("FromMessage conversion error -> {0}")]
    FromMessage(String),

    #[error("ToMessage conversion error -> {0}")]
    ToMessage(String),

    #[error("ChatMessage conversion error -> {0}")]
    ChatMessage(String)

}

impl RawStrConversionError {

    pub fn new(conv: StrConversion, message: String) -> RawStrConversionError {

        match conv {
            StrConversion::FromMessage => RawStrConversionError::FromMessage(message),
            StrConversion::ToMessage => RawStrConversionError::ToMessage(message),
            StrConversion::ChatMessage => RawStrConversionError::ChatMessage(message)
        }

    }

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

    pub fn from_raw_ptrs(channel_id: i32, from: *const i8, to: *const i8, chat_message: *const i8) -> Result<RawSwtorMessage, RawStrConversionError> {

        let converter = |ptr: *const i8, conv: StrConversion| -> Result<String, RawStrConversionError> {

            unsafe {

                match CStr::from_ptr(ptr).to_str() {
                    Ok(s) => { 
                        return Ok(s.to_string()) 
                    },
                    Err(_) => {}
                }

                // WTF, sometimes the pointer is a pointer to a pointer to a string and sometimes it's just a pointer to a string.
                // Issue appeared in update 7.6x (12/10/2024)
                match CStr::from_ptr(*(ptr as *const *const i8)).to_str() {
                    Ok(s) => { 
                        return Ok(s.to_string()) 
                    },
                    Err(e) => {
                        return Err(RawStrConversionError::new(conv, e.to_string()))
                    }
                }

            }

        };

        let t_from         = converter(from, StrConversion::FromMessage)?;
        let t_to           = converter(to, StrConversion::ToMessage)?;
        let t_chat_message = converter(chat_message, StrConversion::ChatMessage)?;

        Ok(RawSwtorMessage::new(channel_id, t_from, t_to, t_chat_message))

    }

}

impl AsJson for RawSwtorMessage {}