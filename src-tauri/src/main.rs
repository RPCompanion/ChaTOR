// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use open;
use tauri::WindowEvent;

#[macro_use]
extern crate lazy_static;

mod swtor_hook;
mod dal;
mod capture_injector;
mod share;
mod utils;
mod swtor;

fn main() {

    dal::init();

    tauri::Builder::default()
        .on_window_event(|event| {

            match event.event() {
                WindowEvent::Destroyed => {
                    capture_injector::stop_injecting_capture();
                },
                _ => {}
            }
            
        })
        .invoke_handler(tauri::generate_handler![
            swtor_hook::start_swtor_hook,
            swtor_hook::is_hooked_in,
            swtor_hook::post::submit_actual_post,
            open_link,
            dal::db::custom_emote::get_all_custom_emotes,
            dal::db::custom_emote::create_custom_emote,
            dal::db::custom_emote::delete_custom_emote,
            dal::db::custom_emote::update_custom_emote,
            dal::db::settings::get_settings,
            dal::db::settings::update_settings,
            dal::characters::get_all_characters,
            dal::db::chat_log::get_chat_log_from_date,
            dal::db::chat_log::get_distinct_dates,
            capture_injector::start_injecting_capture,
            capture_injector::stop_injecting_capture,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_link(link: String) {
    let _ = open::that(link);
}