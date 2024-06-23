
mod share;
mod swtor;
mod utils;

mod lib_only;

use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering;
use std::sync::Arc;

use std::str;
use std::thread;
use std::time::Duration;

use lib_only::chat_message;

use share::CaptureMessage;

use windows::Win32::System::LibraryLoader::GetModuleHandleA;
use windows::core::PCSTR;

use lib_only::{submit_message, drain_messages};

#[macro_use]
extern crate lazy_static;

lazy_static! {
    static ref QUIT: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
}


#[ctor::ctor]
fn detour_init() {

    match start_tcp_messager() {
        Ok(_) => {},
        Err(_) => { return; }
    }

    set_panic_hook();
    start_quit_listener();

    unsafe {
        begin_hook();
    }

}

fn start_tcp_messager() -> Result<(), &'static str> {

    let mut stream = TcpStream::connect("127.0.0.1:4592").unwrap();

    thread::spawn(move || {

        loop {

            if QUIT.load(Ordering::Relaxed) {
                break;
            }

            for message in drain_messages() {
                stream.write(message.as_bytes()).unwrap();
            }
            thread::sleep(Duration::from_millis(100));

        }

    });
    Ok(())

}

fn set_panic_hook() {

    std::panic::set_hook(Box::new(|panic_info| {
        submit_message(CaptureMessage::Panic(format!("Panic: {panic_info:?}")));
    }));

}

fn start_quit_listener() {

    thread::spawn(|| {

        let listener = TcpListener::bind("127.0.0.1:4593").unwrap();
        listener.accept().unwrap();

        end_detours();

        QUIT.store(true, Ordering::Relaxed);

    });


}

unsafe fn begin_hook() {

    match GetModuleHandleA(PCSTR(b"swtor.exe\0".as_ptr())) {
        Ok(hmodule) => {
            submit_message(CaptureMessage::Info("Found module".to_string()));
            submit_message(CaptureMessage::Info(format!("Module handle: {:?}", hmodule)));
            begin_detours(hmodule.0);
        },
        Err(_) => {
            submit_message(CaptureMessage::Info("Failed to find module".to_string()));
        }
    }

}

fn begin_detours(base_address: isize) {

    chat_message::begin_detour(base_address);

}

fn end_detours() {

    chat_message::end_detour();

}