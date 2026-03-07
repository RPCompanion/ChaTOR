// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::process;

use clap::Parser;

use dal::db::settings::Settings;
use open;
use share::AsJson;
use tracing::{error, info};
use sysinfo::{ProcessesToUpdate, System};

use native_dialog::{DialogBuilder, MessageLevel};


mod dal;
mod share;
mod utils;
mod swtor;

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

    let response = DialogBuilder::message()
        .set_title("ChaTOR Crash")
        .set_text("Unable to run multiple instances of ChaTOR. Close other instances?")
        .set_level(MessageLevel::Error)
        .confirm()
        .show()
        .unwrap_or(false);

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

    #[cfg(target_os = "windows")]
    check_multiple_instances();

    chator_lib::run();

}

