
use tracing::error;
use rusqlite::params;

use crate::dal::db;

pub struct CacheJediapedia {
    pub global_id: u64
}

impl CacheJediapedia {

    pub fn new(global_id: u64) -> Self {
        Self {
            global_id
        }
    }

    pub fn get(&self) -> Option<String> {

        let conn = db::get_connection();
        const QUERY: &str = 
        "
            SELECT
                html
            FROM
                Cache_Jediapedia
            WHERE
                global_id = ?
        ";

        let row = conn.query_row(QUERY, params![self.global_id as i64], |row| row.get::<usize, String>(0));

        match row {
            Ok(html) => Some(html),
            Err(_) => None
        }

    }

    pub fn save(&self, html: &str) {

        let conn = db::get_connection();
        const QUERY: &str = 
        "
            INSERT INTO 
                Cache_Jediapedia (global_id, html)
            VALUES
                (?, ?)
            ON CONFLICT (global_id) 
            DO 
                UPDATE SET html = excluded.html;
        ";

        match conn.execute(QUERY, params![self.global_id as i64, html]) {
            Ok(_) => (),
            Err(e) => error!("Failed to save cache: {}", e)
        }

    }

}