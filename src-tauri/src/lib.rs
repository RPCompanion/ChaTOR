
mod share;
mod swtor;
mod utils;

mod lib_only;

use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use std::sync::atomic::{AtomicBool, AtomicU16, Ordering};

use std::str;
use std::thread;
use std::time::Duration;

use lib_only::chat_message;

use share::CaptureMessage;

use windows::Win32::System::LibraryLoader::GetModuleHandleA;
use windows::core::PCSTR;

use lib_only::{submit_message, drain_messages};

static QUIT: AtomicBool = AtomicBool::new(false);

// TcpListener port for the chator client
static CHATOR_PORT: AtomicU16 = AtomicU16::new(0);
// TcpListener port for this injected module
static MODULE_PORT: AtomicU16  = AtomicU16::new(0);

dll_syringe::payload_procedure! {

    /* 
        This function is called by the chator client to initialize the module.
        Returns the port that the module is listening on.
    */
    fn init_capture_module(chator_port: u16) -> u16 {

        if capture_module_initalized() {

            CHATOR_PORT.store(chator_port, Ordering::Relaxed);
            return MODULE_PORT.load(Ordering::Relaxed);

        }

        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port     = listener.local_addr().unwrap().port();

        CHATOR_PORT.store(chator_port, Ordering::Relaxed);
        MODULE_PORT.store(port, Ordering::Relaxed);

        set_panic_hook();
        start_quit_listener(listener);

        if let Err(_) = start_tcp_messenger() {
            return 0
        }

        unsafe {
            begin_hook();
        }

        port

    }

}

fn capture_module_initalized() -> bool {
    CHATOR_PORT.load(Ordering::Relaxed) != 0
}

fn should_quit() -> bool {
    QUIT.load(Ordering::Relaxed)
}

fn start_tcp_messenger() -> Result<(), &'static str> {

    let stream_connector = move || -> Result<TcpStream, &'static str> {

        loop {

            if should_quit() {
                return Err("Quitting");
            }

            /* 
                I'm making the assumption that the chator client might change the port later on (definitely possible in dev environments).
                This is a simple way to handle that.
            */
            let ip_addr_str = format!("127.0.0.1:{}", CHATOR_PORT.load(Ordering::Relaxed));

            match TcpStream::connect(&ip_addr_str) {
                Ok(stream) => { return Ok(stream); },
                Err(_) => { thread::sleep(Duration::from_millis(1000)); }
            }

        }

    };

    let mut stream = stream_connector()?;

    thread::spawn(move || {

        loop {

            if should_quit() {
                break;
            }

            for message in drain_messages() {

                if let Err(_) = stream.write(message.as_bytes()) {

                    if should_quit() {
                        break;
                    }

                    if let Ok(s) = stream_connector() {
                        stream = s;
                    } else {
                        return;
                    }

                    stream.write(message.as_bytes()).unwrap();

                }

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

fn start_quit_listener(listener: TcpListener) {

    thread::spawn(move || {

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