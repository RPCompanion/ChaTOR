use chrono::{DateTime, Utc};
use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::dal::db;
use crate::utils::StringUtils;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiceRoll {
    #[serde(default = "default_timestamp")]
    pub timestamp: DateTime<Utc>,
    pub player_name: String,
    pub result_text: String,
}

fn default_timestamp() -> DateTime<Utc> {
    Utc::now()
}

impl DiceRoll {
    pub fn as_json_str(&self) -> String {
        serde_json::to_string(self).unwrap()
    }

    pub fn as_u64_hash(&self) -> u64 {
        self.as_json_str().as_u64_hash()
    }

    pub fn save_to_db(&self) {
        let conn = db::get_connection();

        const INSERT_PLAYER: &str = "
            INSERT OR IGNORE INTO
                Characters (character_name)
            SELECT
                ?1
            WHERE NOT EXISTS (SELECT 1 FROM Characters WHERE character_name = ?1);
        ";

        let _ = conn.execute(INSERT_PLAYER, &[&self.player_name]);

        const INSERT_ROLL: &str = "
            INSERT OR IGNORE INTO
                DiceRollLog (roll_hash, character_id, result_text)
            SELECT
                ?1,
                C.character_id,
                ?2
            FROM
                Characters C
            WHERE
                C.character_name = ?3;
        ";

        let _ = conn.execute(
            INSERT_ROLL,
            params![self.as_u64_hash() as i64, &self.result_text, &self.player_name],
        );
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DiceRollLogEntry {
    pub dice_roll_log_id: i32,
    pub character_name: String,
    pub timestamp: String,
    pub result_text: String,
}

pub fn get_dice_rolls_from_date(date: String) -> Vec<DiceRollLogEntry> {
    let conn = db::get_connection();
    const SELECT: &str = "
        SELECT
            DRL.dice_roll_log_id,
            C.character_name,
            datetime(DRL.timestamp, 'localtime'),
            DRL.result_text
        FROM
            DiceRollLog DRL
            INNER JOIN Characters C ON DRL.character_id = C.character_id
        WHERE
            date(DRL.timestamp, 'localtime') = ?1
        ORDER BY DRL.dice_roll_log_id ASC;
    ";

    let mut stmt = conn.prepare(SELECT).unwrap();
    let iter = stmt
        .query_map([date], |row| {
            Ok(DiceRollLogEntry {
                dice_roll_log_id: row.get(0)?,
                character_name: row.get(1)?,
                timestamp: row.get(2)?,
                result_text: row.get(3)?,
            })
        })
        .unwrap();

    iter.map(|r| r.unwrap()).collect()
}

#[tauri::command]
pub fn get_dice_rolls_for_date(date: String) -> Vec<DiceRollLogEntry> {
    get_dice_rolls_from_date(date)
}
