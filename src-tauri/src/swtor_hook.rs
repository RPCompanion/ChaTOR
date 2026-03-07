pub mod post;

#[tauri::command]
pub fn is_hooked_in(connection: tauri::State<'_, std::sync::Arc<crate::service_connection::ServiceConnection>>) -> bool {
    connection.is_connected()
}

#[tauri::command]
pub fn start_swtor_hook() {
    // The service handles hooking automatically on connect.
    // This is now a no-op kept for frontend compatibility.
}
