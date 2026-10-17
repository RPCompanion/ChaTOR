pub mod post;

use std::sync::Arc;
use crate::service_connection::{FromClient, ServiceConnection};

#[tauri::command]
pub fn is_hooked_in(connection: tauri::State<'_, Arc<ServiceConnection>>) -> bool {
    connection.is_connected()
}

#[tauri::command]
pub fn start_swtor_hook() {
    // The service handles hooking automatically on connect.
    // This is now a no-op kept for frontend compatibility.
}

#[tauri::command]
pub fn set_capture_chat_log(
    connection: tauri::State<'_, Arc<ServiceConnection>>,
    enabled: bool,
) -> Result<(), String> {
    if enabled {
        // The service needs the offset table and the dynamic-lookup preference
        // before it injects, so push them first.
        let settings = crate::dal::db::settings::get_settings();
        connection
            .send(FromClient::ConfigureOffsets {
                dynamic_lookup: settings.chat_log.dynamic_offset_lookup,
                table: crate::offsets::table(),
            })
            .map_err(|e| e.to_string())?;
    }
    connection
        .send(FromClient::CaptureChatLog(enabled))
        .map_err(|e| e.to_string())
}
