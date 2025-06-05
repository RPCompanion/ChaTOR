
use std::{ffi::CStr, str::Utf8Error};
use encoding_rs::WINDOWS_1252;
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

                        if s.chars().any(|c| (c as u32) > 255) || s.len() == 0 {

                            return Ok(CStr::from_ptr(*(ptr as *const *const i8))
                                .to_str()
                                .unwrap()
                                .to_string());

                        }

                        return Ok(s.to_string());

                    },
                    Err(_) => Ok(CStr::from_ptr(*(ptr as *const *const i8))
                        .to_str()
                        .unwrap()
                        .to_string())
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