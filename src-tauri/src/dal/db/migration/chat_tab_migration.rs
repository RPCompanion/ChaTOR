
use serde::{Deserialize, Serialize};

use tracing::debug;
use rusqlite::params;
use crate::dal::db::{get_connection, settings::{chat_log::chat_tab::{ChannelDispatcher, ChatTab}, Settings}};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct OldChatTab {
    pub name: String,
    pub channels: Vec<i32>,
    pub default_channel: Option<i32>
}

impl OldChatTab {

    pub fn migrate() -> Result<(), &'static str> {

        let settings = Settings::get_json()?;
        let chat_tabs: &Vec<serde_json::Value> = settings["chat_log"]
            .as_object().unwrap()["window"]
            .as_object().unwrap()["chat_tabs"]
            .as_array().unwrap();

        if chat_tabs.len() > 0 && !chat_tabs[0]["channels"][0].is_i64() {
            debug!("Chat tabs have already been migrated");
            return Ok(())
        }

        let chat_tabs: Vec<ChatTab> = chat_tabs
            .iter()
            .map(|ct| serde_json::from_value::<OldChatTab>(ct.clone()).unwrap().into())
            .collect();

        let conn = get_connection();
        const MIGRATE_CHAT_TABS: &str = 
        "
            UPDATE
                Settings
            SET settings = json_replace(
                settings, 
                '$.chat_log.window.chat_tabs', 
                json(?1)
            );
        ";

        debug!("{} {:?}", chat_tabs.len(), serde_json::to_string(&chat_tabs).unwrap());

        if let Err(e) = conn.execute(MIGRATE_CHAT_TABS, params![serde_json::to_string(&chat_tabs).unwrap()]) {
            debug!("Failed to migrate chat tabs: {:?}", e);
        }

        Ok(())

    }

}

impl Into<ChatTab> for OldChatTab {
    
    fn into(self) -> ChatTab {

        ChatTab {
            name: self.name,
            channels: self.channels.into_iter().map(|channel| ChannelDispatcher::RegularDispatch(channel)).collect(),
            default_channel: self.default_channel.map(|channel| ChannelDispatcher::RegularDispatch(channel))
        }

    }

}