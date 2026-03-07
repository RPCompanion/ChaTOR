use std::sync::Arc;

use crate::dal::db::user_character_messages::UserCharacterMessages;
use crate::service_connection::{FromClient, ServiceConnection};

#[tauri::command]
pub async fn submit_post(
    connection: tauri::State<'_, Arc<ServiceConnection>>,
    retry: bool,
    character_message: UserCharacterMessages,
) -> Result<(), String> {
    if !connection.is_connected() {
        return Err("Service not connected".to_string());
    }

    let callback_id = connection.next_callback_id();
    let (tx, rx) = tokio::sync::oneshot::channel();

    connection.register_callback(callback_id, tx);

    connection
        .send(FromClient::SubmitPost {
            retry,
            character_message,
            callback_id,
        })
        .map_err(|e| e.to_string())?;

    match rx.await {
        Ok(result) => result,
        Err(_) => Err("Service connection lost while waiting for response".to_string()),
    }
}
