
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct WidthHeight {
    pub width: i32,
    pub height: i32
}