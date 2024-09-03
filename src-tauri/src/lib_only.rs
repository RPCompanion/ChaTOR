
use std::sync::LazyLock;
use std::sync::Mutex;

use crate::share::{CaptureMessage, AsJson};

pub mod chat_message;
pub mod friends_list;

static MESSAGES: LazyLock<Mutex<Vec<String>>> = LazyLock::new(|| Mutex::new(Vec::new()));

pub fn submit_message(capture_message: CaptureMessage) {

    let mut messages = MESSAGES.lock().unwrap();
    messages.push(capture_message.as_json());

}

pub fn drain_messages() -> Vec<String> {

    let mut messages = MESSAGES.lock().unwrap();
    messages.drain(..).collect()

}