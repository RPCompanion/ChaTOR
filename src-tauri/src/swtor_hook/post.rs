


use crate::swtor::SwtorChannel;
use crate::utils::StringUtils;

use crate::dal::db::user_character_messages::{CommandMessage, UserCharacterMessages};

use std::sync::Mutex;
use std::sync::LazyLock;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;
use serde::Serialize;

use crate::swtor_hook;
use crate::swtor_hook::message_hash_container::MessageHashContainer;

use windows::Win32::Foundation::{LPARAM, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, SendMessageW, WM_CHAR, WM_KEYDOWN, WM_KEYUP};

static MESSAGE_HASH_CONTAINER: LazyLock<Mutex<MessageHashContainer>> = LazyLock::new(|| Mutex::new(MessageHashContainer::new()));

static WRITING: AtomicBool = AtomicBool::new(false);

const ENTER_KEY: usize     = 0x0D;
const BACKSPACE_KEY: usize = 0x08;
const SHIFT_KEY: usize     = 0x10;

const RETRY_LOGIC_DELAY: u64 = 500;

#[derive(Serialize, Clone)]
pub enum PostMessageResponse {
    Success,
    Failed(&'static str)
}

pub fn push_incoming_message_hash(channel: SwtorChannel, hash: u64) {
    MESSAGE_HASH_CONTAINER.lock().unwrap().push(channel, hash);
}

fn post_message(msg_type: u32, wparam: usize, millis: u64) {

    if let Some(hwnd) = swtor_hook::get_hwnd() {

        unsafe {
            let _ = PostMessageW(hwnd, msg_type, WPARAM(wparam), LPARAM(0));
        }

        if millis > 0 {
            thread::sleep(Duration::from_millis(millis));
        }

    }

}

fn send_message(msg_type: u32, wparam: usize, millis: u64) {

    if let Some(hwnd) = swtor_hook::get_hwnd() {

        unsafe {
            let _ = SendMessageW(hwnd, msg_type, WPARAM(wparam), LPARAM(0));
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

fn attempt_post_submission(message: &str) {

    post_message(WM_KEYDOWN, ENTER_KEY, 250);

    for c in message.chars() {
        post_message(WM_CHAR, c as usize, 10);
    }

    post_message(WM_KEYDOWN, ENTER_KEY, 20);

}

fn attempt_post_submission_with_retry(command_message: &CommandMessage) -> Result<(), &'static str> {

    let c_message    = command_message.concat();
    let message_hash = command_message.message.as_u64_hash();

    for _ in 0..3 {

        attempt_post_submission(&c_message);
        for _ in 0..4 {

            let lock = MESSAGE_HASH_CONTAINER.lock().unwrap();
            if lock.message_hashes.contains(&message_hash) {
                return Ok(());
            } else if lock.channels.contains(&SwtorChannel::PlayerNotFound) {
                return Err("Player not found");
            }

            thread::sleep(Duration::from_millis(RETRY_LOGIC_DELAY));

        }

    }

    Err("Failed to post message")

}

fn retry_logic(character_message: UserCharacterMessages) -> Result<(), &'static str> {

    let command_messages = character_message.get_all_command_message_splits()?;
    for command_message in command_messages {        

        if command_message.is_command_only() || !command_message.should_retry() {
            attempt_post_submission(&command_message.concat());
        } else {
            attempt_post_submission_with_retry(&command_message)?;
        }

        thread::sleep(Duration::from_millis(250));
        
    }

    Ok(())

}

fn non_retry_logic(character_message: UserCharacterMessages) -> Result<(), &'static str> {

    for message in character_message.messages {
        attempt_post_submission(&message);
        thread::sleep(Duration::from_millis(250));
    }

    Ok(())

}

fn block_window_focus_thread(window: tauri::Window) {

    thread::spawn(move || {

        let dur = Duration::from_millis(10);

        while WRITING.load(Ordering::Relaxed) {

            if swtor_hook::window_in_focus() {
                let _ = window.set_focus();
            }

            thread::sleep(dur);

        }

    });

}

#[tauri::command]
pub fn submit_post(window: tauri::Window, retry: bool, mut character_message: UserCharacterMessages) {

    if WRITING.load(Ordering::Relaxed) {

        window.emit("submit_post_response", PostMessageResponse::Failed("ChaTOR is busy writing already")).unwrap();
        return;

    }

    WRITING.store(true, Ordering::Relaxed);

    block_window_focus_thread(window.clone());
    thread::spawn(move || {

        character_message.prepare_messages();
        character_message.store();

        MESSAGE_HASH_CONTAINER.lock().unwrap().clear();

        prep_game_for_input();

        if retry {

            if let Err(e) = retry_logic(character_message) {
                window.emit("submit_post_response", PostMessageResponse::Failed(e)).unwrap();
            }

        } else {

            if let Err(e) = non_retry_logic(character_message) {
                window.emit("submit_post_response", PostMessageResponse::Failed(e)).unwrap();
            }

        }

        window.emit("submit_post_response", PostMessageResponse::Success).unwrap();
        WRITING.store(false, Ordering::Relaxed);

    });

}