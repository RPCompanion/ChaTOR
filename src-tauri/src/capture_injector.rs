
use serde::{Deserialize, Serialize};
use serde_json::{Deserializer, Value};

use std::{io::{Read, Write}, net::{TcpListener, TcpStream}, sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}, time::Duration};
use std::thread;

use dll_syringe::{process::OwnedProcess, Syringe};

use crate::{dal::db, swtor_hook};

use self::{message_container::MessageContainer, swtor_message::SwtorMessage};

pub mod message_container;
pub mod player_gui_state;
pub mod swtor_message;

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
pub fn start_injecting_capture(window: tauri::Window) -> Result<(), CaptureError> {

    if INJECTED.load(Ordering::Relaxed) {
        return Err(CaptureError::AlreadyInjected);
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

        tcp_thread.join().unwrap();
        syringe.eject(injected_payload.unwrap()).unwrap();
        INJECTED.store(false, Ordering::Relaxed);
        println!("Payload ejected");

    });
    

    return Ok(());

}

fn start_tcp_listener_loop() {

    let msg_container = Arc::clone(&MESSAGE_CONTAINER);
    let listener = TcpListener::bind("127.0.0.1:4592").unwrap();
    let mut stream = listener.accept().unwrap().0;

    println!("Listening for messages");
    let mut buffer: [u8; 2048] = [0; 2048];
    while CONTINUE_LOGGING.load(Ordering::Relaxed) {

        stream.read(&mut buffer).unwrap();
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
        thread::sleep(Duration::from_millis(100));
    }
    println!("Stopped listening for messages");

    if let Ok(mut stream) = TcpStream::connect("127.0.0.1:4593") {
        stream.write(b"stop").unwrap();
    }

}

fn start_logging_propagation(window: tauri::Window) {

    let messages = Arc::clone(&MESSAGE_CONTAINER);
    thread::spawn(move || {

        while CONTINUE_LOGGING.load(Ordering::Relaxed) || !messages.lock().unwrap().unstored_messages.is_empty() {

            let unstored_messages = messages.lock().unwrap().drain_unstored();
            save_messages_to_database(unstored_messages.clone());
            thread::sleep(Duration::from_secs(1));

        }

    });

}

fn save_messages_to_database(messages: Vec<SwtorMessage>) {

    const INSERT_MESSAGE: &str = 
    "
        INSERT INTO 
            ChatLog (message)
        VALUES
        (?);
    ";

    let conn = db::get_connection();
    let mut stmt = conn.prepare(INSERT_MESSAGE).unwrap();
    for message in messages {
        stmt.execute(&[&message.as_json_str()]).unwrap();
    }

}

#[tauri::command]
pub fn stop_injecting_capture() {

    CONTINUE_LOGGING.store(false, Ordering::Relaxed);

}