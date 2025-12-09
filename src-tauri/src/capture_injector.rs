
use std::sync::LazyLock;
use std::{io::{ErrorKind, Read, Write}, net::{TcpListener, TcpStream}, sync::{atomic::{AtomicBool, Ordering}, Mutex}, time::Duration};
use std::thread;

use syringe_container::SyringeContainer;
use tracing::{error, info, debug};

use serde::{Deserialize, Serialize};
use serde_json::{Deserializer, Value};
use dll_syringe::{process::OwnedProcess, Syringe};
use chator_macros::sha256_to_array;

use crate::{share::CaptureMessage, swtor_hook};
use crate::dal::db::swtor_message::SwtorMessage;

pub mod message_container;
mod syringe_container;

use self::message_container::SwtorMessageContainer;

const SUPPORTED_SWTOR_CHECKSUM: [u8; 32] = sha256_to_array!("9555053A5286FC1FC7AAAFC5EA15836A23CF709702F77D34317EB8B6925C9D76");

static MESSAGE_CONTAINER: LazyLock<Mutex<SwtorMessageContainer>> = LazyLock::new(|| Mutex::new(SwtorMessageContainer::new()));

static INJECTED: AtomicBool = AtomicBool::new(false);
static CONTINUE_LOGGING: AtomicBool = AtomicBool::new(false);

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

        let syringe_container = SyringeContainer::inject(&syringe);

        if syringe_container.is_err() {
            INJECTED.store(false, Ordering::Relaxed);
            CONTINUE_LOGGING.store(false, Ordering::Relaxed);
            return;
        }

        let syringe_container = syringe_container.unwrap();

        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let chator_port = listener.local_addr().unwrap().port();

        info!("ChaTOR listening on port {}", chator_port);

        // ChaTOR must have restarted for this to be the case.
        let module_port: u16 = if syringe_container.capture_module_initalized() {

            info!("Capture module already initialized");
            syringe_container.set_chator_port(chator_port);
            syringe_container.get_module_ports().1

        } else {

            info!("Initializing capture module");
            syringe_container.init_capture_module(chator_port)

        };

        info!("Module listening on {}", module_port);

        let tcp_thread = thread::spawn(move || {
            start_tcp_listener_loop(listener, module_port);
        });

        start_logging_propagation(window);
        tcp_thread.join().unwrap();

        if let Err(err) = syringe_container.eject() {
            error!("Error ejecting payload: {:?}", err);
        } else {
            info!("Payload ejected");
        }

        CONTINUE_LOGGING.store(false, Ordering::Relaxed);
        INJECTED.store(false, Ordering::Relaxed);

    });

}

fn start_tcp_listener_loop(listener: TcpListener, module_port: u16) {

    let mut stream = listener.accept().unwrap().0;

    stream.set_read_timeout(Some(Duration::from_millis(1000))).unwrap();

    info!("Listening for messages");
    let mut buffer: [u8; 2048] = [0; 2048];
    while CONTINUE_LOGGING.load(Ordering::Relaxed) {

        match stream.read(&mut buffer) {
            Ok(_) => {},
            Err(ref e) if e.kind() == ErrorKind::TimedOut || e.kind() == ErrorKind::WouldBlock => {
                continue;
            },
            Err(err) => {
                error!("Error reading from stream: {:?}", err);
                break;
            }
        }

        Deserializer::from_slice(&buffer).into_iter::<Value>().for_each(|value| {

            if let Ok(value) = value {

                if let Ok(message) = serde_json::from_value(value) {

                    debug!("Received message: {:?}", message);
                    handle_message(message);

                }

            }

        });
        buffer = [0; 2048];
    }
    info!("Stopped listening for messages");

    if let Ok(mut stream) = TcpStream::connect(&format!("127.0.0.1:{}", module_port)) {
        stream.write(b"stop").unwrap();
    }

    thread::sleep(Duration::from_secs(1));

}

fn handle_message(message: CaptureMessage) {

    match message {

        CaptureMessage::Panic(panic_message) => {
            panic!("{}", panic_message);
        },
        _ => {
            MESSAGE_CONTAINER
                .lock()
                .unwrap()
                .push(message);
        }

    }

}

fn start_logging_propagation(window: tauri::Window) {

    thread::spawn(move || {

        while CONTINUE_LOGGING.load(Ordering::Relaxed) || !MESSAGE_CONTAINER.lock().unwrap().unstored_messages.is_empty() {

            let unstored_messages = MESSAGE_CONTAINER
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