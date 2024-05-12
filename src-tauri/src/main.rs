// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use open;

#[macro_use]
extern crate lazy_static;

mod swtor_hook;
mod dal;
mod capture_injecter;

fn main() {

    dal::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            swtor_hook::start_swtor_hook,
            swtor_hook::is_hooked_in,
            swtor_hook::submit_actual_post,
            open_link,
            dal::db::custom_emote::get_all_custom_emotes,
            dal::db::custom_emote::create_custom_emote,
            dal::db::custom_emote::delete_custom_emote,
            dal::db::custom_emote::update_custom_emote,
            dal::db::settings::get_settings,
            dal::db::settings::update_settings,
            capture_injecter::start_injecting_capture,
            capture_injecter::stop_injecting_capture
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_link(link: String) {
    let _ = open::that(link);
}