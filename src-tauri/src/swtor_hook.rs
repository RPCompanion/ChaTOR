
use serde::{Deserialize, Serialize};
use std::process::Child;
use std::sync::{Mutex, Arc};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread::{self, JoinHandle};
use std::time::Duration;

use tauri::Window;
use serde_json::json;
use windows::Win32::Foundation::{HWND, LPARAM, BOOL, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, 
    GetWindowThreadProcessId,
    GetWindowTextW,
    PostMessageW,
    SendMessageW,
    WM_KEYDOWN,
    WM_PASTE,
    WM_CHAR, 
    GetForegroundWindow, 
    WM_KEYUP
};

use clipboard_win::{formats::Unicode, set_clipboard};

lazy_static! {
    static ref SWTOR_HWND: Arc<Mutex<Option<HWND>>> = Arc::new(Mutex::new(None));
}

#[derive(Deserialize, Serialize)]
pub struct NewCharacterMessage {
    pub messages: Vec<String>
}

const ENTER_KEY: usize     = 0x0D;
const ESC_KEY: usize       = 0x1B;
const BACKSPACE_KEY: usize = 0x08;
const A_KEY: usize         = 0x41;
const V_KEY: usize         = 0x56;
const CONTROL_KEY: usize   = 0x11;
const SHIFT_KEY: usize     = 0x10;

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, param1: LPARAM) -> BOOL {

    let mut process_id: u32 = 0;
    GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));

    if process_id == param1.0 as u32 {
        SWTOR_HWND.lock().unwrap().replace(hwnd);
        return BOOL(0);
    }

    return BOOL(1);

}

unsafe extern "system" fn enum_windows_existing_proc(hwnd: HWND, _param1: LPARAM) -> BOOL {

    let mut text: [u16; 256] = [0; 256];
    GetWindowTextW(hwnd, &mut text);

    let window_text: String;
    match String::from_utf16(&text) {
        Ok(text) => {
            window_text = text.replace("\0", "");
        },
        Err(_) => {
            return BOOL(1);
        }
    }

    if window_text == "Star Wars™: The Old Republic™" {
        SWTOR_HWND.lock().unwrap().replace(hwnd);
        return BOOL(0);
    }

    return BOOL(1);

}

pub fn hook_into_process(child: Child) {

    unsafe {

        match EnumWindows(Some(enum_windows_proc), LPARAM(child.id() as isize)) {
            Ok(_) => {},
            Err(_) => {}
        }

    }

}

pub fn hook_into_existing() {

    unsafe {
            
        match EnumWindows(Some(enum_windows_existing_proc), LPARAM(0)) {
            Ok(_) => {
                //Enumerated every window and wasn't able to find ConanSandbox
                SWTOR_HWND.lock().unwrap().take();
            },
            Err(_) => {}
        }
        
    }

}

fn post_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    if let Some(hwnd) = SWTOR_HWND.lock().unwrap().as_ref() {

        unsafe {
            let _ = PostMessageW(*hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            thread::sleep(Duration::from_millis(millis));
        }

    }

}

fn send_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    if let Some(hwnd) = SWTOR_HWND.lock().unwrap().as_ref() {

        unsafe {
            let _ = SendMessageW(*hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            thread::sleep(Duration::from_millis(millis));
        }

    }

}

fn window_in_focus() -> bool {

    if let Some(hwnd) = SWTOR_HWND.lock().unwrap().as_ref() {

        unsafe {
            return GetForegroundWindow() == *hwnd;
        }

    }

    false

}

#[tauri::command]
pub fn submit_actual_post(character_message: NewCharacterMessage) {

    thread::spawn(move || {

        //post_message(WM_KEYDOWN, ESC_KEY, 250);
        //post_message(WM_KEYDOWN, ESC_KEY, 250);
        for message in character_message.messages {        

            let post = message
                .replace("ChatGPT", "")
                .replace("”", "\"");

            post_message(WM_KEYDOWN, ENTER_KEY, 250);

            for c in post.chars() {
                post_message(WM_CHAR, c as usize, 10);
            }

            //set_clipboard(Unicode, &post).unwrap();

            //send_message(WM_KEYDOWN, CONTROL_KEY, 50);
            //send_message(WM_KEYDOWN, V_KEY, 50);

            post_message(WM_KEYDOWN, ENTER_KEY, 20);
            thread::sleep(Duration::from_millis(250));
            
        }
    });    

}

#[tauri::command]
pub fn is_hooked_in() -> bool {

    SWTOR_HWND.lock().unwrap().is_some()

}

#[tauri::command]
pub fn start_swtor_hook(window: Window) {

    if SWTOR_HWND.lock().unwrap().is_some() {
        return;
    }

    thread::spawn(move || {

        loop {

            hook_into_existing();

            window.emit("swtor_hooked_in", json!({
                "hooked_in": is_hooked_in(),
            })).unwrap();

            thread::sleep(Duration::from_millis(1000));

        }

    });

}