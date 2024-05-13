
use serde::{Deserialize, Serialize};
use std::sync::{atomic::{AtomicBool, Ordering}, Arc};
use std::thread;

use dll_syringe::{process::OwnedProcess, Syringe};

use crate::swtor_hook;

pub mod message_container;
pub mod player_gui_state;
pub mod message_parser;

lazy_static! {
    static ref INJECTED: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
}

#[derive(Deserialize, Serialize)]
pub enum CaptureError {
    AlreadyInjected,
    SwtorNotRunning,
    WrongGuiSettings
}

#[tauri::command]
pub fn start_injecting_capture() -> Result<(), CaptureError> {

    if INJECTED.load(Ordering::Relaxed) {
        return Err(CaptureError::AlreadyInjected);
    }

    if !player_gui_state::user_has_valid_settings() {
        return Err(CaptureError::WrongGuiSettings);
    }

    let swtor_pid = swtor_hook::get_pid();
    if swtor_pid.is_none() {
        return Err(CaptureError::SwtorNotRunning);
    }

    INJECTED.store(true, Ordering::Relaxed);
    let swtor_pid = swtor_pid.unwrap();

    let target_process = OwnedProcess::from_pid(swtor_pid).unwrap();
    let syringe = Syringe::for_process(target_process);

    return Ok(());

}

fn start_tcp_listener() {

    

}

#[tauri::command]
pub fn stop_injecting_capture() {

}