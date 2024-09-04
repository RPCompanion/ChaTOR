// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dal::db::settings::app_settings::TAURI_WINDOW_SETTINGS;
use open;
use tauri::{Manager, PhysicalSize, WindowEvent};
use tauri::api::dialog::blocking::{ask, message};
use tracing::{error, info};

mod swtor_hook;
mod dal;
mod capture_injector;
mod share;
mod utils;
mod swtor;
mod crash_reporter;
mod config;
mod logging;
mod network;

use crash_reporter::CrashReporter;

fn main() {

    let _guard = logging::init();
    init_system();
    info!("Starting ChaTOR");

    let tauri_response = 
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
            let mut settings = dal::db::settings::get_settings();

            if TAURI_WINDOW_SETTINGS.width > settings.app.window.width || TAURI_WINDOW_SETTINGS.height > settings.app.window.height {

                settings.app.window = *TAURI_WINDOW_SETTINGS;
                dal::db::settings::update_settings(settings.clone());
                
            }

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
            swtor_hook::post::submit_post,
            open_link,
            dal::open_db_dir,
            dal::db::account::get_account,
            dal::db::account::save_account,
            dal::db::account::character::save_character,
            dal::db::account::character::get_all_characters,
            dal::db::custom_emote::get_all_custom_emotes,
            dal::db::custom_emote::create_custom_emote,
            dal::db::custom_emote::delete_custom_emote,
            dal::db::custom_emote::update_custom_emote,
            dal::db::custom_emote::update_custom_emotes_batch,
            dal::db::custom_channel::get_all_custom_channels,
            dal::db::custom_channel::save_custom_channel,
            dal::db::custom_channel::delete_custom_channel,
            dal::db::settings::get_settings,
            dal::db::settings::update_settings,
            dal::character_colors::get_all_character_colors,
            dal::db::chat_log::get_chat_log_from_date,
            dal::db::chat_log::get_distinct_dates,
            dal::db::chat_log::get_todays_chat_log,
            dal::db::chat_log::datetags::get_all_date_tag_favourites,
            dal::db::chat_log::datetags::save_date_tag,
            dal::game_data::get_name_by_global_id,
            capture_injector::start_injecting_capture,
            capture_injector::stop_injecting_capture,
            network::fetch_content,
            network::fetch_jediapedia_content,
            get_version
        ])
        .run(tauri::generate_context!());

    if let Err(e) = tauri_response {
            
        error!("Error starting Tauri: {:?}", e);
        let response = ask(None::<&tauri::Window>, "ChaTOR Error", "Error starting Tauri. You may need to install or reinstall Microsoft's Webview2. Do you want to open the download page?");

        if response {
            open_link(config::config().microsoft_webview2_url.clone());
        }
        
    }

    info!("Thanks for using ChaTOR");

}

fn init_system() {

    setup_panic_hook();
    setup_sigterm_handler();
    setup_config();

    dal::init();
    
}

fn setup_config() {

    /* 
        If the user modified their config file in an invalid way, we need to exit.
    */
    if let Err(e) = config::init() {

        error!("Error initializing config: {:?}", e);
        message(None::<&tauri::Window>, "ChaTOR Error", "Error initializing config file. Have you modified it?");
        std::process::exit(1);

    }

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

        let open_log_dir = || {

            match std::env::current_dir() {
                Ok(dir) => {
                    let _ = open::that(format!("{}/{}", dir.to_str().unwrap(), "logs"));
                },
                Err(_) => {}
            }

        };

        error!("Panic: {:?}", panic_info);
        capture_injector::stop_injecting_capture();
        let response = ask(None::<&tauri::Window>, "ChaTOR Crash", "ChaTOR has crashed. Send a crash report?");

        if response {
            CrashReporter::new(format!("{:?}", panic_info)).submit()
        } else {
            open_log_dir();
        }        

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