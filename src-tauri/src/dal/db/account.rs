
use uuid::Uuid;
use serde::{Serialize, Deserialize};

use rusqlite::params;

use crate::dal::db;

#[derive(Serialize, Deserialize)]
pub struct Account {
    account_token: Uuid
}

impl Account {

    pub fn get() -> Result<Account, &'static str> {

        let conn = db::get_connection();

        const QUERY: &str = 
        "
            SELECT 
                account_token
            FROM 
                account 
            LIMIT 1;
        ";

        let result = conn.query_row(QUERY, [], |row| {

            Ok(Account {
                account_token: row.get(0).unwrap()
            })

        });

        match result {
            Ok(account) => Ok(account),
            Err(_) => Err("Error getting account")
        }

    }

    pub fn save(&self) -> Result<(), &'static str> {

        let conn = db::get_connection();

        const QUERY: &str =
        "
            INSERT INTO 
                account (account_id, account_token)
            VALUES
                (1, ?1);
        ";

        match conn.execute(QUERY, params![self.account_token]) {
            Ok(_) => Ok(()),
            Err(_) => Err("Error saving account")
        }

    }

}

#[tauri::command]
pub fn get_account() -> Result<Account, &'static str> {
    Account::get()
}

#[tauri::command]
pub fn save_account(account: Account) -> Result<(), &'static str> {
    account.save()
}