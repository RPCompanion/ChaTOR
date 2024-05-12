
use em_libs::dal::em_dirs::EmDirs;

pub mod db;
pub mod characters;

pub fn get_em_dirs() -> EmDirs {
    EmDirs::new(env!("CARGO_PKG_NAME"))
}

pub fn init() {
    db::init();
}