
use tokio::task;
use crate::utils::StringUtils;

use crate::dal::db::user_character_messages::{CommandMessage, UserCharacterMessages};

use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use crate::swtor_hook;

use windows::Win32::Foundation::{LPARAM, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, SendMessageW, WM_CHAR, WM_KEYDOWN, WM_KEYUP};

lazy_static! {
    static ref WRITING: Arc<AtomicBool> = Arc::new(AtomicBool::new(false));
    static ref MESSAGE_HASHES: Arc<Mutex<Vec<u64>>> = Arc::new(Mutex::new(Vec::new()));
}

const ENTER_KEY: usize     = 0x0D;
const BACKSPACE_KEY: usize = 0x08;
const SHIFT_KEY: usize     = 0x10;

pub fn push_incoming_message_hash(hash: u64) {
    MESSAGE_HASHES.lock().unwrap().push(hash);
}

fn post_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    let hwnd = swtor_hook::get_hwnd();
    if let Some(hwnd) = hwnd {

        unsafe {
            let _ = PostMessageW(hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            thread::sleep(Duration::from_millis(millis));
        }

    }

}

fn send_message(msg_type: u32, wparam: usize, millis: u64) {

    let wparam = WPARAM(wparam);

    let hwnd = swtor_hook::get_hwnd();
    if let Some(hwnd) = hwnd {

        unsafe {
            let _ = SendMessageW(hwnd, msg_type, wparam, LPARAM(0));
        }
        if millis > 0 {
            thread::sleep(Duration::from_millis(millis));
        }

    }

}

fn prep_game_for_input() {

    for _ in 0..64 {
        send_message(WM_KEYDOWN, BACKSPACE_KEY, 2);
    }

    post_message(WM_KEYDOWN, SHIFT_KEY, 0);
    post_message(WM_KEYDOWN, ENTER_KEY, 50);

    post_message(WM_KEYUP, ENTER_KEY, 0);
    post_message(WM_KEYUP, SHIFT_KEY, 50);

}

fn attempt_post_submission(window: &tauri::Window, message: &str) {

    post_message(WM_KEYDOWN, ENTER_KEY, 250);

    for c in message.chars() {

        post_message(WM_CHAR, c as usize, 10);

        if swtor_hook::window_in_focus() {
            window.set_focus().unwrap();
        }

    }

    post_message(WM_KEYDOWN, ENTER_KEY, 20);

}

fn attempt_post_submission_with_retry(window: &tauri::Window, command_message: &CommandMessage) -> bool {

    let message_hashes = Arc::clone(&MESSAGE_HASHES);
    let c_message      = command_message.concat();
    let message_hash   = command_message.message.as_u64_hash();

    let mut retries = 0;
    while retries < 3 {

        attempt_post_submission(window, &c_message);

        for _ in 0..4 {
            thread::sleep(Duration::from_millis(500));
            if message_hashes.lock().unwrap().contains(&message_hash) {
                return true;
            }
        }
        
        retries += 1;

    }

    false

}

fn retry_logic(window: &tauri::Window, character_message: UserCharacterMessages) -> Result<(), &'static str> {

    let command_messages = character_message.get_all_command_message_splits()?;
    for command_message in command_messages {        

        if command_message.is_command_only() {
            attempt_post_submission(&window, &command_message.concat());
        } else if !attempt_post_submission_with_retry(&window, &command_message) {
            return Err("Failed to post message");
        }

        thread::sleep(Duration::from_millis(250));
        
    }

    Ok(())

}

fn non_retry_logic(window: &tauri::Window, character_message: UserCharacterMessages) -> Result<(), &'static str> {

    for message in character_message.messages {
        attempt_post_submission(&window, &message);
        thread::sleep(Duration::from_millis(250));
    }

    Ok(())

}

#[tauri::command]
pub async fn submit_actual_post(window: tauri::Window, retry: bool, mut character_message: UserCharacterMessages) -> Result<(), &'static str> {

    if WRITING.load(Ordering::Relaxed) {
        return Err("Already writing");
    }

    WRITING.store(true, Ordering::Relaxed);

    let result = task::spawn_blocking(move || {

        character_message.prepare_messages();
        character_message.store();

        let message_hashes   = Arc::clone(&MESSAGE_HASHES);
        message_hashes.lock().unwrap().clear();

        prep_game_for_input();

        if retry {
            retry_logic(&window, character_message)?;
        } else {
            non_retry_logic(&window, character_message)?;
        }

        Ok(())

    }).await.unwrap();

    WRITING.store(false, Ordering::Relaxed);
    result

}