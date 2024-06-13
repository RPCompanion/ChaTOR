// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use std::path::Path;

use open;
use tauri::{Manager, PhysicalSize, WindowEvent};
use tracing::{info, error};
use tracing_subscriber::{self, fmt, prelude::*};
use tracing_appender::{self, non_blocking::WorkerGuard};

#[macro_use]
extern crate lazy_static;

mod swtor_hook;
mod dal;
mod capture_injector;
mod share;
mod utils;
mod swtor;



fn main() {

    let _guard = init_logging();
    init_system();
    info!("Starting Chator");

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

            window.set_always_on_top(settings.app.always_on_top)
                .expect("error while setting always on top.");

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
            dal::db::custom_emote::update_custom_emotes_batch,
            dal::db::settings::get_settings,
            dal::db::settings::update_settings,
            dal::characters::get_all_characters,
            dal::db::chat_log::get_chat_log_from_date,
            dal::db::chat_log::get_distinct_dates,
            dal::db::chat_log::datetags::get_all_date_tag_favourites,
            dal::db::chat_log::datetags::save_date_tag,
            capture_injector::start_injecting_capture,
            capture_injector::stop_injecting_capture,
            get_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn init_logging() -> WorkerGuard {

    let path = Path::new("./logs");
    if !path.exists() {

        std::fs::create_dir("./logs")
            .expect("error while creating logs directory");

    }

    let file_appender = tracing_appender::rolling::hourly("./logs", "chator.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    tracing_subscriber::registry()
        .with(fmt::layer()
            .with_writer(non_blocking)
            .with_level(true)
            .with_ansi(false)
        )
        .init();

    guard

}

fn init_system() {

    setup_panic_hook();
    setup_sigterm_handler();
    dal::init();
    dal::db::settings::init();
    
}

fn setup_sigterm_handler() {

    ctrlc::set_handler(|| {
        capture_injector::stop_injecting_capture();
        std::process::exit(0);
    })
    .expect("Error setting Ctrl-C handler.");

}

fn setup_panic_hook() {

    std::panic::set_hook(Box::new(|panic_info| {

        match std::env::current_dir() {
            Ok(dir) => {
                let _ = open::that(format!("{}/{}", dir.to_str().unwrap(), "logs"));
            },
            Err(_) => {}
        }
        capture_injector::stop_injecting_capture();
        error!("Panic: {:?}", panic_info);

    }));

}

#[tauri::command]
fn open_link(link: String) {
    let _ = open::that(link);
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}