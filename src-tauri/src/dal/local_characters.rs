
use std::fs;
use std::fs::DirEntry;

use serde::{Serialize, Deserialize};
use directories::ProjectDirs;

use tracing::error;

use super::colors::Color;


/**
 * Parsed from .ini files found in C:\Users\USERACCOUNT\AppData\Local\SWTOR\swtor\settings
 */
#[derive(Serialize, Deserialize)]
pub struct LocalCharacterInfo {
    pub character_name: String,
    pub channel_colors: Option<Vec<Color>>
}

impl LocalCharacterInfo {

    pub fn get_all_characters() -> Result<Vec<LocalCharacterInfo>, &'static str> {

        if let Some(project) = ProjectDirs::from("com", "SWTOR", "swtor") {

            let path = project.config_local_dir().parent().unwrap().join("settings");
            let mut characters: Vec<LocalCharacterInfo> = Vec::new();

            let entries = path.read_dir();

            if entries.is_err() {
                return Err("Could not read settings directory. Is SWTOR installed?");
            }

            for entry in entries.unwrap() {

                match entry {
                    Ok(entry) => {
                        let character = LocalCharacterInfo::get_character(entry);
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

    fn get_character(entry: DirEntry) -> Option<LocalCharacterInfo> {

        let e_path = entry.path();
        if !e_path.is_file() {
            return None;
        }

        let file_name = e_path.file_name().unwrap().to_str().unwrap();
        if !file_name.contains("PlayerGUIState") {
            return None;
        }

        let character_name = file_name.split("_").nth(1).unwrap();
        let channel_colors = LocalCharacterInfo::get_gui_colors(e_path.to_str().unwrap());

        return Some(LocalCharacterInfo { character_name: character_name.to_string(), channel_colors });

    }

    fn get_gui_colors(path: &str) -> Option<Vec<Color>> {

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
                return None

            }

            return Some(color_results.unwrap());

        }

        None

    }

}

#[tauri::command]
pub fn get_all_local_characters() -> Result<Vec<LocalCharacterInfo>, &'static str> {

    LocalCharacterInfo::get_all_characters()
    
}