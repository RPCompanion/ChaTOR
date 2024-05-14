
mod share;

use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::sync::Mutex;

use std::ffi::CStr;
use std::str;
use std::thread;
use std::time::Duration;

use retour::static_detour;

use share::MessageType;
use share::RawSwtorMessage;
use std::mem;

use windows::Win32::System::LibraryLoader::GetModuleHandleA;
use windows::core::PCSTR;

static_detour! {
    static ChatHook: extern "C" fn(*mut u64, *const i8);
}

#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref MESSAGES: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));
    static ref QUIT: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
}

const CHAT_RELATIVE_ADDRESS: isize = 0x0ccd360;

#[ctor::ctor]
fn detour_init() {

    match start_tcp_messager() {
        Ok(_) => {},
        Err(_) => { return; }
    }

    start_quit_listener();
    begin_hook();

}

fn start_tcp_messager() -> Result<(), &'static str> {

    let mut stream = TcpStream::connect("127.0.0.1:4592").unwrap();

    thread::spawn(move || {

        let messages = Arc::clone(&MESSAGES);
        loop {

            if QUIT.load(Ordering::Relaxed) {
                break;
            }

            for message in messages.lock().unwrap().drain(..) {
                stream.write(message.as_bytes()).unwrap();
            }
            thread::sleep(Duration::from_millis(100));

        }

    });
    Ok(())

}

fn submit_message(message_type: MessageType, message: &str) {

    MESSAGES.lock().unwrap().push(RawSwtorMessage::new(message_type, message.to_string()).as_json_str());

}

fn start_quit_listener() {

    thread::spawn(|| {

        let listener = TcpListener::bind("127.0.0.1:4593").unwrap();
        listener.accept().unwrap();

        unsafe {
            ChatHook.disable().unwrap();
        }

        QUIT.store(true, Ordering::Relaxed);

    });


}

fn begin_hook() {

    unsafe {

        match GetModuleHandleA(PCSTR(b"swtor.exe\0".as_ptr())) {
            Ok(hmodule) => {
                submit_message(MessageType::Info, "Found module");
                submit_message(MessageType::Info, &format!("Module handle: {:?}", hmodule));
                begin_detour(hmodule.0 + CHAT_RELATIVE_ADDRESS);
            },
            Err(_) => {
                submit_message(MessageType::Info, "Failed to find module");
            }
        }

    }

}

fn begin_detour(address: isize) {

    unsafe {

        let target: extern "C" fn(*mut u64, *const i8) = mem::transmute(address);
        match ChatHook.initialize(target, my_detour) {
            Ok(_) => {
                submit_message(MessageType::Info, "Detour initialized");
                ChatHook.enable().unwrap();
            },
            Err(_) => {
                submit_message(MessageType::Info, "Failed to initialize detour");
            }
        }

    }

}

fn my_detour(param_1: *mut u64, some_string: *const i8) {

    unsafe {

        let c_str: &CStr = CStr::from_ptr(some_string);
        let str_slice: &str = c_str.to_str().unwrap();

        if str_slice.to_lowercase().contains("</font>") {
            submit_message(MessageType::Chat, str_slice);
        }

        ChatHook.call(param_1, some_string);

    }

}