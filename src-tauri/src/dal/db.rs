
use crate::dal;
use rusqlite::{params, Connection};

const TABLES: &str = include_str!("../../sql/tables.sql");

pub mod custom_emote;

pub fn get_connection() -> Connection {

    let em_dirs = dal::get_em_dirs();
    let db_path = em_dirs.get_data_dir_path("blinky.db");
    Connection::open(db_path).unwrap()

}

pub fn init() {

    let conn = get_connection();
    conn.execute(TABLES, params![]).unwrap();

}