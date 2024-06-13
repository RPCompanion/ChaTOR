
use std::fs;
use std::path::Path;

use crate::dal;
use rusqlite::Connection;

pub mod custom_emote;
pub mod settings;
pub mod chat_log;
pub mod user_character_messages;
pub mod log;
pub mod swtor_message;
pub mod migration;

use migration::Migration;
use custom_emote::CustomEmote;

pub fn get_connection() -> Connection {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    Connection::open(db_path).unwrap()

}

pub fn get_sql_file(partial_path: &str) -> Result<String, std::io::Error> {

    let path_str = format!("./sql/{}", partial_path);
    let path = Path::new(&path_str);
    fs::read_to_string(path)

}

fn database_exists() -> bool {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    std::path::Path::new(&db_path).exists()

}

pub fn init() {

    check_to_copy_old_database();

    let existing_database = database_exists();

    let tables = get_sql_file("tables.sql")
        .expect("Error reading tables.sql");

    let conn = get_connection();
    conn.execute_batch(&tables)
        .expect("Error creating tables");

    let migration = Migration::new(conn);

    if !existing_database {

        migration.insert_game_version();

    } else if migration.should_migrate() {

        migration.migrate().expect("Error migrating database");

    }

    finalize_init();

}

fn finalize_init() {

    let _ = CustomEmote::clean_up_order_index_gaps();

}

fn check_to_copy_old_database() {

    if database_exists() {
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
        .join("swtor_chat/data/blinky.db");

    old_db_path.to_str().unwrap().to_string()

}