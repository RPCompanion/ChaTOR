
use std::{ffi::CStr, str::Utf8Error};
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

impl AsJson for RawSwtorMessage {}