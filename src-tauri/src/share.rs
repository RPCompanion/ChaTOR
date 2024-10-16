
use std::net::TcpListener;

use raw_swtor_message::RawSwtorMessage;
use serde::{Deserialize, Serialize};

pub mod raw_swtor_message;

#[derive(Deserialize, Serialize)]
pub enum CaptureMessage {
    Info(String),
    CaptureError(String),
    Panic(String),
    Chat(RawSwtorMessage)
}

impl AsJson for CaptureMessage {}

pub trait AsJson {

    fn as_json(&self) -> String where Self: serde::ser::Serialize {
        serde_json::to_string(self).unwrap()
    }

}


/// Binds a TcpListener to a random port on the loopback address.
pub fn bind_tcp_listener() -> (TcpListener, u16) {

    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let port     = listener.local_addr().unwrap().port();

    (listener, port)

}