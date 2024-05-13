
use serde::{Deserialize, Serialize};
use serde_json::{Deserializer, Value};

use std::{io::Write, net::{TcpListener, TcpStream}, sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}, time::Duration};
use std::thread;

use dll_syringe::{process::OwnedProcess, Syringe};

use crate::{share::Message, swtor_hook};

use self::message_container::MessageContainer;

pub mod message_container;
pub mod player_gui_state;
pub mod message_parser;

lazy_static! {
    static ref INJECTED: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref CONTINUE_LOGGING: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref MESSAGE_CONTAINER: Arc<Mutex<MessageContainer>> = Arc::new(Mutex::new(MessageContainer::new()));
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
    let swtor_pid = swtor_pid.unwrap();

    thread::spawn(move || {

        INJECTED.store(true, Ordering::Relaxed);
        CONTINUE_LOGGING.store(true, Ordering::Relaxed);
        
        let target_process = OwnedProcess::from_pid(swtor_pid).unwrap();
        let syringe = Syringe::for_process(target_process);

        let injected_payload = if cfg!(debug_assertions) {
            syringe.inject("./target/debug/swtor_chat_capture.dll").unwrap()
        } else {
            syringe.inject("./swtor_chat_capture.dll").unwrap()
        };

        start_tcp_listener_loop();

        thread::sleep(Duration::from_secs(5));
        syringe.eject(injected_payload).unwrap();
        INJECTED.store(false, Ordering::Relaxed);

    });
    return Ok(());

}

fn start_tcp_listener_loop() {

    let msg_container = Arc::clone(&MESSAGE_CONTAINER);
    let listener = TcpListener::bind("127.0.0.1:4392").unwrap();
    let mut stream = listener.accept().unwrap().0;

    while CONTINUE_LOGGING.load(Ordering::Relaxed) {

        Deserializer::from_reader(&mut stream).into_iter::<Value>().for_each(|value| {

            if let Ok(value) = value {

                if let Ok(message) = serde_json::from_value(value) {

                    msg_container.lock()
                        .unwrap()
                        .push(message)

                }

            }

        });

    }

    if let Ok(mut stream) = TcpStream::connect("127.0.0.1:4393") {
        stream.write(b"stop").unwrap();
    }

}

#[tauri::command]
pub fn stop_injecting_capture() {

    CONTINUE_LOGGING.store(false, Ordering::Relaxed);

}