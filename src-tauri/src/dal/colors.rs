
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8
}

impl Color {

    pub fn new(r: u8, g: u8, b: u8) -> Color {
        Color { r, g, b }
    }

    pub fn from_hex(hex: &str) -> Result<Color, &'static str> {

        let hex = hex.trim_start_matches("#");

        if hex.len() != 6 {
            return Err("Invalid hex color");
        }

        let r = u8::from_str_radix(&hex[0..2], 16).map_err(|_| "Invalid r hex color")?;
        let g = u8::from_str_radix(&hex[2..4], 16).map_err(|_| "Invalid g hex color")?;
        let b = u8::from_str_radix(&hex[4..6], 16).map_err(|_| "Invalid b hex color")?;

        Ok(Color { r, g, b })

    }

}