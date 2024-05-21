
use std::fs;
use std::path::Path;

use sha2::{Sha256, Digest};
use windows::core::PWSTR;
use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT, PROCESS_QUERY_INFORMATION};
use std::sync::{Arc, Mutex, OnceLock};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;
use tokio::time::{sleep, Duration as TokioDuration};
use tokio::task;

use tauri::Window;
use serde_json::json;
use windows::Win32::Foundation::{BOOL, HWND, LPARAM, MAX_PATH, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId, PostMessageW, SendMessageW, WM_CHAR, WM_KEYDOWN, WM_KEYUP
};

use crate::dal::db::user_character_messages::{CommandMessage, UserCharacterMessages};
use crate::utils::StringUtils;

lazy_static! {
    static ref SWTOR_HWND: Arc<Mutex<Option<HWND>>> = Arc::new(Mutex::new(None));
    static ref SWTOR_PID: Arc<Mutex<Option<u32>>> = Arc::new(Mutex::new(None));
    static ref WRITING: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref MESSAGE_HASHES: Arc<Mutex<Vec<u64>>> = Arc::new(Mutex::new(Vec::new()));
}

static PROCESS_CHECKSUM: OnceLock<Vec<u8>> = OnceLock::new();

const ENTER_KEY: usize     = 0x0D;
const BACKSPACE_KEY: usize = 0x08;
const SHIFT_KEY: usize     = 0x10;

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

async fn post_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    let result: Option<HWND> = task::block_in_place(|| {

        let t_hwnd = Arc::clone(&SWTOR_HWND);
        let temp = t_hwnd.lock().unwrap().clone();
        temp

    });

    if let Some(hwnd) = result {

        unsafe {
            let _ = PostMessageW(hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            sleep(TokioDuration::from_millis(millis)).await;
        }

    }

}

async fn send_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    let result: Option<HWND> = task::block_in_place(|| {

        let t_hwnd = Arc::clone(&SWTOR_HWND);
        let temp = t_hwnd.lock().unwrap().clone();
        temp

    });

    if let Some(hwnd) = result {

        unsafe {
            let _ = SendMessageW(hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            sleep(TokioDuration::from_millis(millis)).await;
        }

    }

}

fn window_in_focus() -> bool {

    let t_hwnd = Arc::clone(&SWTOR_HWND);
    if let Some(hwnd) = t_hwnd.lock().unwrap().as_ref() {

        unsafe {
            return GetForegroundWindow() == *hwnd;
        }

    }

    false

}

async fn prep_game_for_input() {

    for _ in 0..64 {
        send_message(WM_KEYDOWN, BACKSPACE_KEY, 2).await;
    }

    post_message(WM_KEYDOWN, SHIFT_KEY, 0).await;
    post_message(WM_KEYDOWN, ENTER_KEY, 50).await;

    post_message(WM_KEYUP, ENTER_KEY, 0).await;
    post_message(WM_KEYUP, SHIFT_KEY, 50).await;

}

async fn attempt_post_submission(window: &tauri::Window, message: &str) {

    post_message(WM_KEYDOWN, ENTER_KEY, 250).await;

    for c in message.chars() {

        post_message(WM_CHAR, c as usize, 10).await;

        if window_in_focus() {
            window.set_focus().unwrap();
        }

    }

    post_message(WM_KEYDOWN, ENTER_KEY, 20).await;

}

async fn attempt_post_submission_with_rety(window: &tauri::Window, command_message: &CommandMessage) -> bool {

    let message_hashes = Arc::clone(&MESSAGE_HASHES);
    let c_message      = command_message.concat();
    let message_hash   = command_message.message.as_u64_hash();

    let mut retries = 0;
    while retries < 3 {

        attempt_post_submission(window, &c_message).await;

        for _ in 0..4 {
            thread::sleep(Duration::from_millis(250));
            if message_hashes.lock().unwrap().contains(&message_hash) {
                return true;
            }
        }
        
        retries += 1;

    }

    false

}

#[tauri::command]
pub async fn submit_actual_post(window: tauri::Window, retry: bool, mut character_message: UserCharacterMessages) -> Result<(), &'static str> {

    if WRITING.load(Ordering::Relaxed) {
        return Err("Already writing");
    }

    WRITING.store(true, Ordering::Relaxed);

    character_message.prepare_messages();

    let command_messages: Vec<CommandMessage>;
    match character_message.get_all_command_message_splits() {
        Ok(messages) => {
            command_messages = messages;
        },
        Err(e) => {
            WRITING.store(false, Ordering::Relaxed);
            return Err(e);
        }
    }

    let message_hashes = Arc::clone(&MESSAGE_HASHES);
    message_hashes.lock().unwrap().clear();

    character_message.store();
    prep_game_for_input().await;

    if retry {

        for command_message in command_messages {        

            if !attempt_post_submission_with_rety(&window, &command_message).await {
                return Err("Failed to post message");
            }

            sleep(TokioDuration::from_millis(250)).await
            
        }

    } else {

        for command_message in command_messages {
            attempt_post_submission(&window, &command_message.concat()).await;
            sleep(TokioDuration::from_millis(250)).await
        };

    }

    WRITING.store(false, Ordering::Relaxed);
    Ok(())

}

pub fn push_incoming_message_hash(hash: u64) {
    MESSAGE_HASHES.lock().unwrap().push(hash);
}

pub fn get_pid() -> Option<u32> {

    SWTOR_PID.lock().unwrap().clone()

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