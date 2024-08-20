
use std::mem;
use retour::static_detour;

use crate::lib_only::submit_message;
use crate::share::raw_swtor_message::RawSwtorMessage;
use crate::share::CaptureMessage;

const CHAT_RELATIVE_ADDRESS: isize = 0x03f3460;

static_detour! {
    static ChatHook: extern "C" fn(*mut u64, *const *const i8, *const *const i8, i32, *const *const i8) -> i64;
}

pub fn begin_detour(base_address: isize) {

    unsafe {

        let target: extern "C" fn(*mut u64, *const *const i8, *const *const i8, i32, *const *const i8) -> i64 = mem::transmute(base_address + CHAT_RELATIVE_ADDRESS);
        match ChatHook.initialize(target, receive_chat_message_detour) {
            Ok(_) => {
                submit_message(CaptureMessage::Info("Chat Message detour initialized".to_string()));
                ChatHook.enable().unwrap();
            },
            Err(_) => {
                submit_message(CaptureMessage::CaptureError("Failed to initialize chat message detour".to_string()));
            }
        }

    }

}

pub fn receive_chat_message_detour(param_1: *mut u64, from: *const *const i8, to: *const *const i8, channel_id: i32, chat_message: *const *const i8) -> i64 {

    match RawSwtorMessage::from_raw_ptrs(channel_id, from, to, chat_message) {
        Ok(message) => {
            submit_message(CaptureMessage::Chat(message));
        },
        Err(_) => {}
    }

    return ChatHook.call(param_1, from, to, channel_id, chat_message);

}

pub fn end_detour() {

    unsafe {
        ChatHook.disable().unwrap();
    }

}