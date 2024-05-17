
use rusqlite::params;

use crate::dal::db;

pub fn log_error(message: &str) {

    let conn = db::get_connection();
    const INSERT_MESSAGE: &str =
    "
        INSERT INTO Log_Errors(error_message)
        VALUES (?1);
    ";
    conn.execute(INSERT_MESSAGE, params![message]).unwrap();

}