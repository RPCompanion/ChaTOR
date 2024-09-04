
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

    pub fn get_default_colors() -> Vec<Color> {

        vec![
            Color::from_hex("b3ecfe").unwrap(),
            Color::from_hex("ff73ff").unwrap(),
            Color::from_hex("ff8022").unwrap(),
            Color::from_hex("a59ff4").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("B3ECFF").unwrap(),
            Color::from_hex("B3ECFF").unwrap(),
            Color::from_hex("B3ECFF").unwrap(),
            Color::from_hex("1d8cfe").unwrap(),
            Color::from_hex("82ec89").unwrap(),
            Color::from_hex("FF00FF").unwrap(),
            Color::from_hex("efbc55").unwrap(),
            Color::from_hex("317A3C").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("FF0000").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("ff7f7f").unwrap(),
            Color::from_hex("EEEE00").unwrap(),
            Color::from_hex("EEEE00").unwrap(),
            Color::from_hex("EEEE00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("ff5400").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("eeee00").unwrap(),
            Color::from_hex("A00000").unwrap(),
            Color::from_hex("C92E56").unwrap(),
            Color::from_hex("BB4FD2").unwrap(),
            Color::from_hex("1FAB29").unwrap(),
            Color::from_hex("FF6600").unwrap(),
        ]

    }

}