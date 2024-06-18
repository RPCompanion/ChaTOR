
use std::{io::{ErrorKind, Read, Write}, net::{TcpListener, TcpStream}, sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}, time::Duration};
use std::thread;

use serde::{Deserialize, Serialize};
use serde_json::{Deserializer, Value};
use dll_syringe::{process::OwnedProcess, Syringe};
use chator_macros::sha256_to_array;

use crate::swtor_hook::{self};
use crate::dal::db::swtor_message::SwtorMessage;

pub mod message_container;
use self::message_container::MessageContainer;

const SUPPORTED_SWTOR_CHECKSUM: [u8; 32] = sha256_to_array!("8D2947D187270E5410FA41AD7907C8EECA898325BE974B6A3233CC777A14CDFD");

lazy_static! {
    static ref INJECTED: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref CONTINUE_LOGGING: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref MESSAGE_CONTAINER: Arc<Mutex<MessageContainer>> = Arc::new(Mutex::new(MessageContainer::new()));
}

#[derive(Deserialize, Serialize)]
pub enum CaptureError {
    AlreadyInjected,
    SwtorNotRunning,
    WrongGuiSettings,
    UnsupportedVersion,
    NotYetFullyReady
}

#[tauri::command]
pub fn start_injecting_capture(window: tauri::Window) -> Result<(), CaptureError> {

    if INJECTED.load(Ordering::Relaxed) {
        return Err(CaptureError::AlreadyInjected);
    }

    let swtor_pid = swtor_hook::get_pid();
    if swtor_pid.is_none() {
        return Err(CaptureError::SwtorNotRunning);
    }
    let swtor_pid = swtor_pid.unwrap();

    match swtor_hook::checksum_match(&SUPPORTED_SWTOR_CHECKSUM) {
        Ok(true) => {},
        Ok(false) => return Err(CaptureError::UnsupportedVersion),
        Err(_) => return Err(CaptureError::NotYetFullyReady)
    }

    start_injecting_thread(swtor_pid, window);
    return Ok(());

}

fn start_injecting_thread(swtor_pid: u32, window: tauri::Window) {

    thread::spawn(move || {

        INJECTED.store(true, Ordering::Relaxed);
        CONTINUE_LOGGING.store(true, Ordering::Relaxed);
        
        let target_process = OwnedProcess::from_pid(swtor_pid).unwrap();
        let syringe = Syringe::for_process(target_process);

        let tcp_thread = thread::spawn(|| {
            start_tcp_listener_loop();
        });
        thread::sleep(Duration::from_secs(1));
        start_logging_propagation(window);

        let injected_payload = if cfg!(debug_assertions) {
            syringe.inject("./target/debug/swtor_chat_capture.dll")
        } else {
            syringe.inject("./swtor_chat_capture.dll")
        };

        match injected_payload {
            Ok(_) => {    
                println!("Payload injected");
            },
            Err(err) => {

                println!("Error injecting payload: {:?}", err);
                INJECTED.store(false, Ordering::Relaxed);
                CONTINUE_LOGGING.store(false, Ordering::Relaxed);
                return;

            }
        }

        let injected_payload = injected_payload.unwrap();

        tcp_thread.join().unwrap();

        if let Err(err) = syringe.eject(injected_payload) {
            println!("Error ejecting payload: {:?}", err);
        } else {
            println!("Payload ejected");
        }
        CONTINUE_LOGGING.store(false, Ordering::Relaxed);
        INJECTED.store(false, Ordering::Relaxed);

    });

}

fn start_tcp_listener_loop() {

    let msg_container = Arc::clone(&MESSAGE_CONTAINER);
    let listener = TcpListener::bind("127.0.0.1:4592").unwrap();
    let mut stream = listener.accept().unwrap().0;

    stream.set_read_timeout(Some(Duration::from_millis(1000))).unwrap();

    println!("Listening for messages");
    let mut buffer: [u8; 2048] = [0; 2048];
    while CONTINUE_LOGGING.load(Ordering::Relaxed) {

        match stream.read(&mut buffer) {
            Ok(_) => {},
            Err(ref e) if e.kind() == ErrorKind::TimedOut || e.kind() == ErrorKind::WouldBlock => {
                continue;
            },
            Err(err) => {
                println!("Error reading from stream: {:?}", err);
                break;
            }
        }

        Deserializer::from_slice(&buffer).into_iter::<Value>().for_each(|value| {

            if let Ok(value) = value {

                if let Ok(message) = serde_json::from_value(value) {

                    msg_container.lock()
                        .unwrap()
                        .push(message)

                }

            }

        });
        buffer = [0; 2048];
    }
    println!("Stopped listening for messages");

    if let Ok(mut stream) = TcpStream::connect("127.0.0.1:4593") {
        stream.write(b"stop").unwrap();
    }
    thread::sleep(Duration::from_secs(1));

}

fn start_logging_propagation(window: tauri::Window) {

    let messages = Arc::clone(&MESSAGE_CONTAINER);
    thread::spawn(move || {

        while CONTINUE_LOGGING.load(Ordering::Relaxed) || !messages.lock().unwrap().unstored_messages.is_empty() {

            let unstored_messages = messages
                .lock()
                .unwrap()
                .drain_unstored();

            if !unstored_messages.is_empty() {
                SwtorMessage::save_messages_to_db(unstored_messages.clone());
                window.emit("swtor_messages", unstored_messages).unwrap();
            }

            thread::sleep(Duration::from_secs(1));

        }

    });

}

#[tauri::command]
pub fn stop_injecting_capture() {

    if !INJECTED.load(Ordering::Relaxed) {
        return;
    }

    CONTINUE_LOGGING.store(false, Ordering::Relaxed);
    
    while INJECTED.load(Ordering::Relaxed) {
        thread::sleep(Duration::from_secs(1));
    }

}