

use crate::dal;
use rusqlite::Connection;

const TABLES: &str = include_str!("../../sql/tables.sql");

pub mod custom_emote;
pub mod settings;
pub mod chat_log;
pub mod user_character_messages;
pub mod log;
pub mod swtor_message;
pub mod migration;

use migration::Migration;

pub fn get_connection() -> Connection {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    Connection::open(db_path).unwrap()

}

fn database_exists() -> bool {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    std::path::Path::new(&db_path).exists()

}

pub fn init() {

    let existing_database = database_exists();

    let conn = get_connection();
    conn.execute_batch(TABLES).expect("Error creating tables");

    let migration = Migration::new(conn);

    if !existing_database {

        migration.insert_game_version();

    } else if migration.should_migrate() {

        migration.migrate().expect("Error migrating database");

    }

}