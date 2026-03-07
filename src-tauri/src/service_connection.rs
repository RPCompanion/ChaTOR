use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::atomic::{AtomicBool, AtomicI64, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tracing::{error, info};

use crate::dal::db::swtor_message::SwtorMessage;
use crate::dal::db::user_character_messages::UserCharacterMessages;

#[derive(Serialize, Deserialize)]
pub enum FromClient {
    CaptureChatLog(bool),
    RetryMessageSubmission(bool),
    SubmitPost {
        retry: bool,
        character_message: UserCharacterMessages,
        callback_id: i64,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum FromService {
    IsHookedIn(bool),
    SwtorMessage(SwtorMessage),
    SubmitPostResult {
        callback_id: i64,
        result: Result<(), String>,
    },
    KeepWindowInFocus(bool),
}

type CallbackSender = tokio::sync::oneshot::Sender<Result<(), String>>;

pub struct ServiceConnection {
    stream: Mutex<Option<TcpStream>>,
    connected: AtomicBool,
    next_callback_id: AtomicI64,
    pending_callbacks: Mutex<HashMap<i64, CallbackSender>>,
}

impl ServiceConnection {
    pub fn new() -> Self {
        Self {
            stream: Mutex::new(None),
            connected: AtomicBool::new(false),
            next_callback_id: AtomicI64::new(1),
            pending_callbacks: Mutex::new(HashMap::new()),
        }
    }

    pub fn is_connected(&self) -> bool {
        self.connected.load(Ordering::Relaxed)
    }

    pub fn send(&self, msg: FromClient) -> Result<(), &'static str> {
        let mut guard = self.stream.lock().unwrap();
        if let Some(ref mut stream) = *guard {
            let mut json = serde_json::to_string(&msg).unwrap();
            json.push('\n');
            stream
                .write_all(json.as_bytes())
                .map_err(|_| "Failed to send message to service")?;
            Ok(())
        } else {
            Err("Service not connected")
        }
    }

    pub fn next_callback_id(&self) -> i64 {
        self.next_callback_id.fetch_add(1, Ordering::Relaxed)
    }

    pub fn register_callback(&self, id: i64, sender: CallbackSender) {
        self.pending_callbacks.lock().unwrap().insert(id, sender);
    }

    fn resolve_callback(&self, id: i64, result: Result<(), String>) {
        if let Some(sender) = self.pending_callbacks.lock().unwrap().remove(&id) {
            let _ = sender.send(result);
        }
    }

    fn set_stream(&self, stream: TcpStream) {
        let mut guard = self.stream.lock().unwrap();
        *guard = Some(stream);
        self.connected.store(true, Ordering::Relaxed);
    }

    fn clear_stream(&self) {
        let mut guard = self.stream.lock().unwrap();
        *guard = None;
        self.connected.store(false, Ordering::Relaxed);
    }
}

pub const DEFAULT_PORT: u16 = 30100;

pub fn start_server(app_handle: AppHandle, connection: Arc<ServiceConnection>) {
    thread::spawn(move || {
        let listener = match TcpListener::bind(format!("0.0.0.0:{}", DEFAULT_PORT)) {
            Ok(l) => l,
            Err(e) => {
                error!("Failed to bind TCP server on port {}: {}", DEFAULT_PORT, e);
                return;
            }
        };

        info!("Service connection server listening on port {}", DEFAULT_PORT);

        for incoming in listener.incoming() {
            match incoming {
                Ok(stream) => {
                    let peer = stream.peer_addr().ok();
                    info!("Service connected from {:?}", peer);

                    let read_stream = match stream.try_clone() {
                        Ok(s) => s,
                        Err(e) => {
                            error!("Failed to clone stream: {}", e);
                            continue;
                        }
                    };

                    connection.set_stream(stream);

                    let app = app_handle.clone();
                    let conn = connection.clone();
                    read_loop(app, conn, read_stream);

                    connection.clear_stream();
                    info!("Service disconnected");

                    let _ = app_handle.emit("swtor_hooked_in", serde_json::json!({ "hooked_in": false }));
                }
                Err(e) => {
                    error!("Failed to accept connection: {}", e);
                }
            }
        }
    });
}

fn read_loop(app: AppHandle, connection: Arc<ServiceConnection>, stream: TcpStream) {
    let reader = BufReader::new(stream);
    for line in reader.lines() {
        match line {
            Ok(line) => {
                if line.trim().is_empty() {
                    continue;
                }
                match serde_json::from_str::<FromService>(&line) {
                    Ok(msg) => handle_service_message(&app, &connection, msg),
                    Err(e) => error!("Failed to parse FromService: {}", e),
                }
            }
            Err(e) => {
                error!("Service connection read error: {}", e);
                break;
            }
        }
    }
}

fn handle_service_message(
    app: &AppHandle,
    connection: &ServiceConnection,
    msg: FromService,
) {
    match msg {
        FromService::IsHookedIn(hooked_in) => {
            let _ = app.emit(
                "swtor_hooked_in",
                serde_json::json!({ "hooked_in": hooked_in }),
            );
        }
        FromService::SwtorMessage(swtor_message) => {
            let _ = app.emit("swtor_messages", vec![swtor_message]);
        }
        FromService::SubmitPostResult { callback_id, result } => {
            connection.resolve_callback(callback_id, result);
        }
        FromService::KeepWindowInFocus(value) => {
            let _ = app.emit(
                "keep_window_in_focus",
                serde_json::json!({ "value": value }),
            );
        }
    }
}
