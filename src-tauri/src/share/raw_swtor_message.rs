
use std::{ffi::CStr, str::Utf8Error};
use encoding_rs::WINDOWS_1252;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use windows::Win32::System::Memory::{
    VirtualQuery, MEMORY_BASIC_INFORMATION, MEM_COMMIT, PAGE_NOACCESS,
    PAGE_READONLY, PAGE_READWRITE, PAGE_EXECUTE_READ, PAGE_EXECUTE_READWRITE,
};

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

            match try_resolve_cstr(ptr) {
                Some(s) => {
                    return Ok(s);
                },
                None => Err(RawStrConversionError::new(conv, "Invalid pointer or string".to_string())),
            }

        };

        let t_from         = converter(from, StrConversion::FromMessage)?;
        let t_to           = converter(to, StrConversion::ToMessage)?;
        let t_chat_message = converter(chat_message, StrConversion::ChatMessage)?;

        Ok(RawSwtorMessage::new(channel_id, t_from, t_to, t_chat_message))

    }

}

unsafe fn is_valid_ptr(ptr: *const u8) -> bool {

    if ptr.is_null() {
        return false;
    }

    let mut mbi = MEMORY_BASIC_INFORMATION::default();
    unsafe {

        let result = VirtualQuery(
            Some(ptr as *const std::ffi::c_void),
            &mut mbi,
            std::mem::size_of::<MEMORY_BASIC_INFORMATION>(),
        );

        if result == 0 {
            return false;
        }

    }

    // Basic check: committed and readable
    mbi.State == MEM_COMMIT
        && matches!(
            mbi.Protect,
            PAGE_READONLY | PAGE_READWRITE | PAGE_EXECUTE_READ | PAGE_EXECUTE_READWRITE
        )
        && (ptr as usize) >= mbi.BaseAddress as usize
        && (ptr as usize) < (mbi.BaseAddress as usize + mbi.RegionSize)
        
}

fn try_resolve_cstr(ptr: *const i8) -> Option<String> {

    unsafe {

        // Try as double pointer
        let double_ptr = ptr as *const *const i8;
        if is_valid_ptr(double_ptr as *const u8) {
            let inner = *double_ptr;
            if is_valid_ptr(inner as *const u8) {
                let cstr = CStr::from_ptr(inner);
                if let Ok(s) = cstr.to_str() {
                    return Some(s.to_string());
                }
            }
        }

        // Try as single pointer
        if is_valid_ptr(ptr as *const u8) {

            let cstr = CStr::from_ptr(ptr);
            if let Ok(s) = cstr.to_str() {

                if !s.is_empty() && s.chars().all(|c| (c as u32) < 256 || (c as u32) >= 32) {
                    return Some(s.to_string());
                }

            }

        }

    }

    None

}

impl AsJson for RawSwtorMessage {}