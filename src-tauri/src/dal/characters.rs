
use std::fs;
use std::fs::DirEntry;

use serde::{Serialize, Deserialize};
use directories::ProjectDirs;


#[derive(Serialize, Deserialize, Clone)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8
}

impl Color {

    pub fn new(r: u8, g: u8, b: u8) -> Color {
        Color { r, g, b }
    }

    pub fn from_hex(hex: &str) -> Color {

        let hex = hex.trim_start_matches("#");
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap();
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap();
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap();
        Color { r, g, b }

    }

    pub fn to_hex(&self) -> String {
        format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b)
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
            for entry in path.read_dir().unwrap() {

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

            return Ok(line.split("=")
                .collect::<Vec<&str>>()[1]
                .trim()
                .split(";")
                .into_iter()
                .filter(|color| !color.is_empty())
                .map(|color| Color::from_hex(color))
                .collect::<Vec<Color>>());

        }

        Err("Could not find ChatColors in file")

    }

    pub fn get_emote_channel_color(&self) -> Option<&Color> {
        self.channel_colors.get(2)
    }

    pub fn get_yell_channel_color(&self) -> Option<&Color> {
        self.channel_colors.get(1)
    }

    pub fn get_say_channel_color(&self) -> Option<&Color> {
        self.channel_colors.get(0)
    }

    pub fn get_whisper_channel_color(&self) -> Option<&Color> {
        self.channel_colors.get(3)
    }

}

#[tauri::command]
pub fn get_all_characters() -> Result<Vec<Character>, &'static str> {
    Character::get_all_characters()
}