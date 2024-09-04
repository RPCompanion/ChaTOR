
use std::fs;
use std::fs::DirEntry;

use serde::{Serialize, Deserialize};
use directories::ProjectDirs;

use tracing::error;


#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8
}

impl Color {

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

#[derive(Serialize, Deserialize)]
pub struct Character {
    pub character_name: String,
    pub channel_colors: Vec<Color>
}

impl Character {

    pub fn get_all_characters() -> Result<Vec<Character>, &'static str> {

        if let Some(project) = ProjectDirs::from("com", "SWTOR", "swtor") {

            let path = project.config_local_dir().parent().unwrap().join("settings");
            let mut characters: Vec<Character> = Vec::new();

            let entries = path.read_dir();

            if entries.is_err() {
                return Err("Could not read settings directory. Is SWTOR installed?");
            }

            for entry in entries.unwrap() {

                match entry {
                    Ok(entry) => {
                        let character = Character::get_character(entry);
                        if character.is_some() {
                            characters.push(character.unwrap());
                        }
                    },
                    Err(_) => {}
                }

            }
            return Ok(characters);

        }

        Err("Could not find settings directory")

    }

    fn get_character(entry: DirEntry) -> Option<Character> {

        let e_path = entry.path();
        if !e_path.is_file() {
            return None;
        }

        let file_name = e_path.file_name().unwrap().to_str().unwrap();
        if !file_name.contains("PlayerGUIState") {
            return None;
        }

        let character_name = file_name.split("_").nth(1).unwrap();
        let channel_colors = Character::get_gui_colors(e_path.to_str().unwrap()).unwrap();
        return Some(Character { character_name: character_name.to_string(), channel_colors });

    }

    fn get_gui_colors(path: &str) -> Result<Vec<Color>, &'static str> {

        let temp    = fs::read(path).unwrap();
        let content = String::from_utf8_lossy(&temp);
        let lines = content.split("\n").collect::<Vec<&str>>();

        if let Some(line) = lines.into_iter().find(|line| line.contains("ChatColors")) {

            let color_results = line.split("=")
                .collect::<Vec<&str>>()[1]
                .trim()
                .split(";")
                .into_iter()
                .filter(|color| !color.is_empty())
                .map(|color| Color::from_hex(color))
                .collect::<Result<Vec<Color>, &'static str>>();

            if color_results.is_err() {

                error!("Could not parse ChatColors: {:?}", color_results.err().unwrap());
                return Ok(Color::get_default_colors());

            }

            return Ok(color_results.unwrap());

        }

        Err("Could not find ChatColors in file")

    }

}

#[tauri::command]
pub fn get_all_characters() -> Result<Vec<Character>, &'static str> {
    Character::get_all_characters()
}