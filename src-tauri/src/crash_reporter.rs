
use tracing::error;
use serde::{Deserialize, Serialize};
use reqwest::blocking::Client;

pub mod sys_info;

use sys_info::SysInfo;

/// Crash report endpoint. Like API_ENDPOINTS in src/lib/api.ts, every API endpoint carries its
/// own version. Debug builds report here too: they are what runs day to day.
const CRASH_REPORT_URL: &str = "https://api.rpcompanion.com/v1/crash_reports/chator";

#[derive(Serialize, Deserialize)]
pub struct CrashReporter {
    pub sys_info: SysInfo,
    pub crash_report: String
}

impl CrashReporter {

    pub fn new(crash_report: String) -> Self {

        Self {
            sys_info: SysInfo::default(),
            crash_report: crash_report
        }

    }

    pub fn submit(&self) {

        let client = Client::new();
        let response = client.post(CRASH_REPORT_URL)
            .header("Content-Type", "application/json")
            .body(self.as_json())
            .send();

        if let Err(e) = response {
            error!("Error submitting crash report: {:?}", e);
        }

    }

    pub fn as_json(&self) -> String {

        serde_json::to_string(self).unwrap()

    }

}