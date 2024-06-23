
use std::ffi::CStr;
use std::mem;
use retour::static_detour;

use crate::lib_only::submit_message;
use crate::share::raw_swtor_message::RawSwtorMessage;
use crate::share::CaptureMessage;

const CHAT_RELATIVE_ADDRESS: isize = 0x03f3740;

static_detour! {
    static ChatHook: extern "C" fn(*mut u64, *const *const i8, *const *const i8, i32, *const *const i8) -> i64;
}

pub fn begin_detour(base_address: isize) {

    unsafe {

        let target: extern "C" fn(*mut u64, *const *const i8, *const *const i8, i32, *const *const i8) -> i64 = mem::transmute(base_address + CHAT_RELATIVE_ADDRESS);
        match ChatHook.initialize(target, receive_chat_message_detour) {
            Ok(_) => {
                submit_message(CaptureMessage::Info("Detour initialized".to_string()));
                ChatHook.enable().unwrap();
            },
            Err(_) => {
                submit_message(CaptureMessage::CaptureError("Failed to initialize detour".to_string()));
            }
        }

    }

}

pub fn receive_chat_message_detour(param_1: *mut u64, from: *const *const i8, to: *const *const i8, channel_id: i32, chat_message: *const *const i8) -> i64 {

    unsafe {

        let t_from         = CStr::from_ptr(*from).to_str().unwrap();
        let t_to           = CStr::from_ptr(*to).to_str().unwrap();
        let t_chat_message = CStr::from_ptr(*chat_message).to_str().unwrap();

        submit_message(CaptureMessage::Chat(RawSwtorMessage::new(channel_id, t_from.to_string(), t_to.to_string(), t_chat_message.to_string())));
        return ChatHook.call(param_1, from, to, channel_id, chat_message);

    }

}

pub fn end_detour() {

    unsafe {
        ChatHook.disable().unwrap();
    }

}