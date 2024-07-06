
use em_libs::dal::em_dirs::EmDirs;

pub mod db;
pub mod characters;
pub mod game_data;

pub fn get_em_dirs() -> EmDirs {

    EmDirs::new(env!("CARGO_PKG_NAME"))
    
}

pub fn init() {

    db::init();
    db::settings::init();
    game_data::init();

}

#[tauri::command]
pub fn open_db_dir() {

    let _ = open::that(get_em_dirs().get_data_dir_path(""));

}