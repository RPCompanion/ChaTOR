// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use open;
use tauri::{Manager, PhysicalSize, WindowEvent};

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

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
    dal::db::settings::init();

    setup_sigterm_handler();

    tauri::Builder::default()
        .on_window_event(|event| {

            match event.event() {
                WindowEvent::Destroyed => {
                    capture_injector::stop_injecting_capture();
                },
                _ => {}
            }
            
        })
        .setup(|app| {

            let window = app.get_window("main").unwrap();
            let settings = dal::db::settings::get_settings();

            window.set_size(PhysicalSize {
                width: settings.app.window.width as f64,
                height: settings.app.window.height as f64
            }).expect("error while setting window size.");

            if settings.app.always_on_top {

                window.set_always_on_top(true)
                    .expect("error while setting always on top.");
                
            }

            Ok(())

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

fn setup_sigterm_handler() {

    ctrlc::set_handler(|| {
        capture_injector::stop_injecting_capture();
        std::process::exit(0);
    })
    .expect("Error setting Ctrl-C handler.");

}

#[tauri::command]
fn open_link(link: String) {
    let _ = open::that(link);
}