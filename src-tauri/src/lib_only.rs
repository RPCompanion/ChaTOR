
use std::sync::Mutex;

use crate::share::CaptureMessage;

pub mod chat_message;
pub mod friends_list;

lazy_static! {
    static ref MESSAGES: Mutex<Vec<String>> = Mutex::new(Vec::new());
}

pub fn submit_message(capture_message: CaptureMessage) {

    let mut messages = MESSAGES.lock().unwrap();
    messages.push(capture_message.as_json_str());

}

pub fn drain_messages() -> Vec<String> {

    let mut messages = MESSAGES.lock().unwrap();
    messages.drain(..).collect()

}