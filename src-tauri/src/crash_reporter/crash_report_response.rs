
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tracing::error;

use crate::dal::db;

#[derive(Serialize, Deserialize)]
pub struct ChatorCrashReportResponse {
    crash_uuid: Uuid
}

impl ChatorCrashReportResponse {

    pub fn save(&self, report: String) {

        let conn = db::get_connection();
        const INSERT_QUERY: &str =
        "
             INSERT INTO CrashReports (crash_uuid, report)
             VALUES (?1, ?2);
        ";

        if let Err(e) = conn.execute(INSERT_QUERY, &[&self.crash_uuid]) {
            error!("Error saving crash report response: {:?}", e);
        }

    }

}
