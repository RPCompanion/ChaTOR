
use std::sync::Arc;

use dal::db::settings::app_settings::TAURI_WINDOW_SETTINGS;
use open;

use native_dialog::{DialogBuilder, MessageLevel};
use tauri::{Manager, PhysicalSize};
use share::AsJson;
use tracing::{error, info};

use crash_reporter::CrashReporter;
use crash_reporter::sys_info::SysInfo;

mod app_dir;
mod swtor_hook;
mod dal;
mod share;
mod utils;
mod swtor;
mod crash_reporter;
mod config;
mod logging;
mod network;
mod offsets;
mod service_connection;
mod service_launcher;
mod steam;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    // Must come first: config, logs, sql, gamedata and the service are all
    // addressed relative to the app directory.
    let app_dir = app_dir::resolve_and_enter();

    let _guard = logging::init();

    init_system();
    info!("Starting ChaTOR");
    info!("App directory: {}", app_dir.display());
    info!("System Information {}", SysInfo::default().as_json());
    info!("Client Settings {}", dal::db::settings::get_settings().as_json());

    let connection = Arc::new(service_connection::ServiceConnection::new());

    let tauri_response = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(connection.clone())
        .setup(move |app| {
            let window = app.get_webview_window("main").unwrap();
            let mut settings = dal::db::settings::get_settings();

            if TAURI_WINDOW_SETTINGS.width > settings.app.window.width
                || TAURI_WINDOW_SETTINGS.height > settings.app.window.height
            {
                settings.app.window = *TAURI_WINDOW_SETTINGS;
                dal::db::settings::update_settings(settings.clone());
            }

            window
                .set_size(PhysicalSize {
                    width: settings.app.window.width as f64,
                    height: settings.app.window.height as f64,
                })
                .expect("error while setting window size.");

            window
                .set_always_on_top(settings.app.always_on_top)
                .expect("error while setting always on top.");

            offsets::init();
            match service_connection::start_server(app.handle().clone(), connection.clone()) {
                Ok(()) => service_launcher::start_supervisor(),
                Err(_) => {
                    error!(
                        "Not launching chator-service: port {} is in use. Is another ChaTOR already running?",
                        service_connection::DEFAULT_PORT
                    );
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            swtor_hook::start_swtor_hook,
            swtor_hook::is_hooked_in,
            swtor_hook::set_capture_chat_log,
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
            dal::db::dice_roll::get_dice_rolls_for_date,
            dal::db::chat_log::datetags::get_all_date_tag_favourites,
            dal::db::chat_log::datetags::save_date_tag,
            dal::game_data::get_name_by_global_id,
            network::fetch_content,
            network::fetch_jediapedia_content,
            get_version
        ])
        .build(tauri::generate_context!());

    match tauri_response {
        Ok(app) => {
            app.run(|_app_handle, event| {
                if matches!(event, tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit) {
                    // Stops the supervisor from relaunching the service while we exit.
                    // The service itself exits when its connection to us closes.
                    service_launcher::mark_shutting_down();
                }
            });
        }
        Err(e) => {
        error!("Error starting Tauri: {:?}", e);

        #[cfg(target_os = "windows")]
        let text = "Error starting Tauri. You may need to install Microsoft WebView2. Do you want to open the download page?";

        #[cfg(not(target_os = "windows"))]
        let text = "Error starting Tauri. You may need to install your operating system's webview component via your package manager.";

        let response = DialogBuilder::message()
            .set_title("ChaTOR Error")
            .set_text(text)
            .set_level(MessageLevel::Error)
            .confirm()
            .show()
            .unwrap_or(false);
        
        #[cfg(target_os = "windows")]
        if response {
            open_link(config::config().microsoft_webview2_url.clone());
        }
        }
    }

    service_launcher::mark_shutting_down();
    info!("Thanks for using ChaTOR");


}

#[tauri::command]
fn open_link(link: String) {

    let _ = open::that(link);

}

#[tauri::command]
fn get_version() -> String {

    env!("CARGO_PKG_VERSION").to_string()
    
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

        let _ = DialogBuilder::message()
            .set_title("ChaTOR Error")
            .set_text("Error initializing config file. Have you modified it?")
            .set_level(MessageLevel::Error)
            .confirm()
            .show()
            .unwrap_or(false);

        std::process::exit(1);

    }

}

fn setup_sigterm_handler() {

    ctrlc::set_handler(|| {
        //capture_injector::stop_injecting_capture();
        std::process::exit(0);
    })
    .expect("Error setting Ctrl-C handler.");

}

fn setup_panic_hook() {

    std::panic::set_hook(Box::new(|panic_info| {

        let open_log_dir = || {

            let _ = open::that(logging::log_dir());

        };

        error!("Panic: {:?}", panic_info);
        //capture_injector::stop_injecting_capture();


        let response = DialogBuilder::message()
            .set_title("ChaTOR Crash")
            .set_text("ChaTOR has crashed. Send a crash report?")
            .set_level(MessageLevel::Error)
            .confirm()
            .show()
            .unwrap_or(false);

        if response {
            CrashReporter::new(format!("{:?}", panic_info)).submit()
        } else {
            open_log_dir();
        }        

    }));

}


