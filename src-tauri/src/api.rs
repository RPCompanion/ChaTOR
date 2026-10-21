//! Every request to the rpcompanion API (rpc-web-service-v2) goes through here or `auth`
//! (sign-in); the webview never calls the API itself. One place picks the server, one HTTP
//! client, one error shape for the UI.

use std::sync::LazyLock;
use std::time::Duration;

use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use tracing::{info, warn};

use crate::auth::BanInfo;

pub const PRODUCTION_API: &str = "https://api.rpcompanion.com";
pub const LOCAL_API: &str = "http://localhost:6578";

pub static HTTP: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent(concat!("ChaTOR/", env!("CARGO_PKG_VERSION")))
        .build()
        .expect("HTTP client")
});

/// Production, except when running against the dev server (`tauri dev`, the same condition
/// that makes the frontend a dev build) with the "Use production API" developer setting off.
pub fn api_base() -> &'static str {
    if tauri::is_dev() && !production_selected() { LOCAL_API } else { PRODUCTION_API }
}

#[cfg(not(test))]
fn production_selected() -> bool {
    crate::dal::db::settings::get_settings().app.use_production_api
}

/// Tests have no settings loaded and run against a local API.
#[cfg(test)]
fn production_selected() -> bool {
    false
}

/// For the Developer settings, which show where requests go.
#[tauri::command]
pub fn get_api_base() -> &'static str {
    api_base()
}

/// The developer toggle. Saved with the settings, so it survives restarts and reloads.
#[tauri::command]
pub fn set_use_production_api(enabled: bool) -> &'static str {
    let mut settings = crate::dal::db::settings::get_settings();
    settings.app.use_production_api = enabled;
    crate::dal::db::settings::update_settings(settings);
    info!("API: {}", api_base());
    api_base()
}

/// What a failed command reports to the UI. `code` is the API's error code, or one of
/// "network", "invalid_response", "server_error" and the sign-in ones in `auth`.
#[derive(Serialize, Deserialize, Debug)]
pub struct ApiError {
    #[serde(default = "server_error")]
    pub code: String,
    pub message: String,
    #[serde(default)]
    pub ban: Option<BanInfo>
}

fn server_error() -> String {
    "server_error".into()
}

impl ApiError {

    pub fn new(code: &str, message: impl Into<String>) -> Self {
        Self { code: code.into(), message: message.into(), ban: None }
    }

    pub fn network(e: reqwest::Error) -> Self {
        warn!("ChaTOR API request failed: {}", e.without_url());
        Self::new("network", "Could not reach the ChaTOR server. Check your connection and try again.")
    }

    pub fn invalid_response() -> Self {
        Self::new("invalid_response", "Unexpected answer from the ChaTOR server.")
    }

    /// The API's error body ({code?, message, ban?}), or a generic error for anything else.
    pub async fn from_response(response: reqwest::Response) -> Self {
        let status = response.status();
        match response.json::<ApiError>().await {
            Ok(error) => error,
            Err(_) => Self::new("invalid_response", format!("The ChaTOR server answered {}.", status))
        }
    }

}

async fn get<T: DeserializeOwned>(path: &str) -> Result<T, ApiError> {

    let response = HTTP.get(format!("{}{}", api_base(), path))
        .send()
        .await
        .map_err(ApiError::network)?;

    if !response.status().is_success() {
        return Err(ApiError::from_response(response).await);
    }

    response.json().await.map_err(|_| ApiError::invalid_response())

}

#[derive(Serialize, Deserialize)]
pub struct Server {
    server_id: i32,
    name: String
}

#[derive(Serialize, Deserialize)]
pub struct StarForgeBeacon {
    avatar_url: Option<String>,
    name: String,
    global_name: Option<String>,
    create_time: String,
    message: String,
    attachments: Vec<String>
}

#[tauri::command]
pub async fn get_servers() -> Result<Vec<Server>, ApiError> {
    get("/v1/system/servers").await
}

#[tauri::command]
pub async fn get_star_forge_beacons() -> Result<Vec<StarForgeBeacon>, ApiError> {
    get("/v1/third_party/discord_beacons/star_forge").await
}

/// Character sheets are not wired up yet; templates are passed on as the API returns them.
#[tauri::command]
pub async fn get_character_templates() -> Result<serde_json::Value, ApiError> {
    get("/v1/character/templates").await
}

#[tauri::command]
pub async fn get_character_template(template_id: i32) -> Result<serde_json::Value, ApiError> {
    get(&format!("/v1/character/template/{}", template_id)).await
}

#[cfg(test)]
mod tests {

    use super::*;

    /// Against a local rpc-web-service-v2 on :6578 with the schema loaded (devdb setup).
    #[tokio::test]
    #[ignore]
    async fn public_endpoints_against_local_api() {
        assert_eq!(api_base(), LOCAL_API);
        assert!(!get_servers().await.unwrap().is_empty());
        get_star_forge_beacons().await.unwrap();
        assert!(get_character_templates().await.unwrap().is_array());

        assert!(get_character_template(i32::MAX).await.is_err());
    }

}
