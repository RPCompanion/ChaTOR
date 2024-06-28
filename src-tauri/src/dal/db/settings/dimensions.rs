
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct WidthHeight {
    pub width: i32,
    pub height: i32
}

impl Default for WidthHeight {

    fn default() -> WidthHeight {

        WidthHeight {
            width: 0,
            height: 176
        }

    }

}