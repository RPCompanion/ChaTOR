
use std::{fs, path::Path};

use crate::dal;
use rusqlite::Connection;

const TABLES: &str = include_str!("../../sql/tables.sql");

pub mod custom_emote;
pub mod settings;
pub mod chat_log;
pub mod user_character_messages;
pub mod log;

pub fn get_connection() -> Connection {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    Connection::open(db_path).unwrap()

}

pub fn init() {

    check_to_copy_old_database();

    let conn = get_connection();
    conn.execute_batch(TABLES).expect("Error creating tables");

}

fn check_to_copy_old_database() {

    if check_if_database_exists() {
        return;
    }

    if !check_if_old_database_path_exists() {
        return;
    }

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    match fs::copy(get_old_database_path(), db_path) {
        Ok(_) => {},
        Err(err) => {
            println!("Error copying old database: {}", err);
        }
    }

}

fn check_if_database_exists() -> bool {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    Path::new(&db_path).exists()

}

fn check_if_old_database_path_exists() -> bool {

    let old_db_path = get_old_database_path();
    Path::new(&old_db_path).exists()

}

fn get_old_database_path() -> String {
            
    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.proj_dirs.data_dir().to_str().unwrap();

    let old_db_path = Path::new(&db_path)
        .parent().unwrap()
        .parent().unwrap()
        .join("SWTOR-Chat/data/blinky.db");

    old_db_path.to_str().unwrap().to_string()

}