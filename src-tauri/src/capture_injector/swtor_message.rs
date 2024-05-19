
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use crate::utils::StringUtils;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SwtorMessage {
    pub channel: i32,
    #[serde(default = "default_timestamp")]
    pub timestamp: DateTime<Utc>,
    pub from: String,
    pub to: String,
    pub message: String,
    
}

fn default_timestamp() -> DateTime<Utc> {
    Utc::now()
}

impl SwtorMessage {

    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

    pub fn as_u64_hash(&self) -> u64 {
        self.as_json_str().as_u64_hash()
    }

}