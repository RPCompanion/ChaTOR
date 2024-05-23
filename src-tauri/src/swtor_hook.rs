
use std::fs;
use std::path::Path;

use sha2::{Sha256, Digest};

use std::sync::{Arc, Mutex, OnceLock};
use std::thread;
use std::time::Duration;


use tauri::Window;
use serde_json::json;
use windows::Win32::Foundation::{BOOL, HWND, LPARAM, MAX_PATH};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId};
use windows::core::PWSTR;
use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT, PROCESS_QUERY_INFORMATION};

pub mod post;

lazy_static! {
    static ref SWTOR_HWND: Arc<Mutex<Option<HWND>>> = Arc::new(Mutex::new(None));
    static ref SWTOR_PID: Arc<Mutex<Option<u32>>> = Arc::new(Mutex::new(None));
}

static PROCESS_CHECKSUM: OnceLock<Vec<u8>> = OnceLock::new();



unsafe fn set_process_checksum() {

    if PROCESS_CHECKSUM.get().is_some() {
        return;
    }

    let pid = SWTOR_PID.lock().unwrap().clone().unwrap();

    let handle = OpenProcess(PROCESS_QUERY_INFORMATION, false, pid);
    if handle.is_err() {
        return;
    }

    let mut buffer: [u16; MAX_PATH as usize + 1] = [0; MAX_PATH as usize + 1];
    let mut size = buffer.len() as u32;

    if let Ok(_) = QueryFullProcessImageNameW(handle.unwrap(), PROCESS_NAME_FORMAT(0), PWSTR(&mut buffer as *mut _), &mut size) {

        let path_str = String::from_utf16(&buffer).unwrap().replace("\0", "");
        let path = Path::new(&path_str);

        let program_bytes = fs::read(path).unwrap();
        let mut hasher = Sha256::new();
        hasher.update(program_bytes);
        PROCESS_CHECKSUM.set(hasher.finalize().as_slice().to_vec()).unwrap();

    }

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

        let mut process_id: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));

        SWTOR_PID.lock().unwrap().replace(process_id);
        SWTOR_HWND.lock().unwrap().replace(hwnd);
        set_process_checksum();

        return BOOL(0);

    }

    return BOOL(1);

}

pub fn hook_into_existing() {

    unsafe {
            
        match EnumWindows(Some(enum_windows_existing_proc), LPARAM(0)) {
            Ok(_) => {
                //Enumerated every window and wasn't able to find SWTOR Window
                SWTOR_HWND.lock().unwrap().take();
                SWTOR_PID.lock().unwrap().take();
            },
            Err(_) => {}
        }
        
    }

}



pub fn window_in_focus() -> bool {

    let t_hwnd = Arc::clone(&SWTOR_HWND);
    if let Some(hwnd) = t_hwnd.lock().unwrap().as_ref() {

        unsafe {
            return GetForegroundWindow() == *hwnd;
        }

    }

    false

}

pub fn get_pid() -> Option<u32> {

    SWTOR_PID.lock().unwrap().clone()

}

pub fn get_hwnd() -> Option<HWND> {

    SWTOR_HWND.lock().unwrap().clone()

}

pub fn checksum_match(checksum: &[u8; 32]) -> Result<bool, &'static str> {

    if let Some(process_checksum) = PROCESS_CHECKSUM.get() {
        return Ok(process_checksum == checksum);
    }
    return Err("PROCESS_CHECKSUM not yet initialized");

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