
use std::mem;
use retour::static_detour;

use crate::lib_only::submit_message;
use crate::share::raw_swtor_message::RawSwtorMessage;
use crate::share::CaptureMessage;

const CHAT_RELATIVE_ADDRESS: isize = 0x0521cc0;

static_detour! {
    static ChatHook: extern "C" fn(*mut u64, *const i8, *const i8, i32, *const i8) -> i64;
}

pub fn begin_detour(base_address: isize) {

    unsafe {

        let target: extern "C" fn(*mut u64, *const i8, *const i8, i32, *const i8) -> i64 = mem::transmute(base_address + CHAT_RELATIVE_ADDRESS);
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

/*

    logging in x64dbg
    rcx = {rcx}, rdx = {s:rdx}, r8 = {s:r8}, r9 = {r9}, rsp: {s:[rsp+0x28]}

    rcx probably points to object that contains the message
    rsp+0x28 points to the message itself (32 bytes of shadow space is reserved for the function call)

*/
pub fn receive_chat_message_detour(param_1: *mut u64, from: *const i8, to: *const i8, channel_id: i32, chat_message: *const i8) -> i64 {


    if cfg!(debug_assertions) {

        submit_message(CaptureMessage::Info(
            format!("RawSwtorMessage::from_raw_ptrs - param_1: {:?}, channel_id: {}, from: {:?}, to: {:?}, chat_message: {:?}", param_1, channel_id, from, to, chat_message)
        ));

    }

    match RawSwtorMessage::from_raw_ptrs(channel_id, from, to, chat_message) {

        Ok(message) => {
            submit_message(CaptureMessage::Chat(message));
        },
        Err(e) => {
            submit_message(CaptureMessage::Error(e.to_string()));
        }
        
    }

    return ChatHook.call(param_1, from, to, channel_id, chat_message);

}

pub fn end_detour() {

    unsafe {
        ChatHook.disable().unwrap();
    }

}