// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process;

use clap::Parser;

use dal::db::settings::app_settings::TAURI_WINDOW_SETTINGS;
use dal::db::settings::Settings;
use open;
use share::AsJson;
use tauri::{Manager, PhysicalSize, WindowEvent};
use tauri::api::dialog::blocking::{ask, message};
use tracing::{error, info};
use sysinfo::{ProcessesToUpdate, System};

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
use crash_reporter::sys_info::SysInfo;
use utils::open_log_dir;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[clap(short, long)]
    generate_default_settings: bool
}

fn parse_args() {

    let args = Args::parse();

    if args.generate_default_settings {

        fs::write("./default_settings.json", Settings::default().as_json()).unwrap(); 
        std::process::exit(0);

    }

}

/// Checks if there are multiple instances of ChaTOR running.
fn check_multiple_instances() {

    let mut sys = System::new_all();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    let processes = 
        sys.processes().iter()
            .filter(|(_, process)| process.name().to_str().unwrap().contains("ChaTOR"))
            .collect::<Vec<_>>();

    if processes.len() == 1 {
        return;
    }

    info!("Multiple instances of ChaTOR running -> {}", processes.len());

    let response = ask(None::<&tauri::Window>, "ChaTOR Crash", "Unable to run multiple instances of ChaTOR. Close other instances?");
    if !response {
        std::process::exit(1);
    }

    let local_pid = process::id();
    for (pid, proc) in processes {

        if local_pid == pid.as_u32() {
            continue;
        }

        proc.kill();

    }

}

fn main() {

    parse_args();

    let _guard = logging::init();

    check_multiple_instances();
    init_system();

    info!("Starting ChaTOR");
    info!("System Information {}", SysInfo::default().as_json());
    info!("Client Settings {}", dal::db::settings::get_settings().as_json());

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
            dal::local_characters::get_all_local_characters,
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

/// Initializes the system.
/// Sets up panic hook, sigterm handler, config and data access layer
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

        let payload: Option<String> = if let Some(payload) = panic_info.payload().downcast_ref::<&str>() {
            Some(payload.to_string())
        } else if let Some(payload) = panic_info.payload().downcast_ref::<String>() {
            Some(payload.clone())
        } else {
            None
        };

        error!("Panic: Payload -> {:?} {:?}", payload, panic_info);
        capture_injector::stop_injecting_capture();

        let response = ask(None::<&tauri::Window>, "ChaTOR Crash", "ChaTOR has crashed. Send a crash report?");
        if response {
            CrashReporter::new(format!("Payload:{:?}\n\nPanic info:{:?}", payload, panic_info)).submit()
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