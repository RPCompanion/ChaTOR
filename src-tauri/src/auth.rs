//! Sign in with Discord through the rpcompanion API (rpc-web-service-v2, `auth::flow`).
//!
//! The session token stays on this side: it is kept in the OS credential store (Windows
//! Credential Manager, the Secret Service on Linux) and never handed to the webview, so a
//! script running in the webview cannot read it.
//!
//! Sign-in: listen on 127.0.0.1:<random port>, ask the API to start a flow for that port, open
//! Discord's consent page in the browser, wait for the API to redirect the browser back to the
//! listener with a one-time ticket, then trade flow secret + ticket for a session.

use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use std::time::Duration;

use reqwest::{Client, StatusCode, Url};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;
use tracing::{info, warn};

const PRODUCTION_API: &str = "https://api.rpcompanion.com";
const LOCAL_API: &str = "http://localhost:6578";

/// Only URLs starting with this are opened in the browser, whatever the API returns.
const DISCORD_AUTHORIZE: &str = "https://discord.com/oauth2/authorize?";

const KEYRING_SERVICE: &str = "ChaTOR";

/// Sessions kept for this run only, when the OS credential store is unavailable.
static MEMORY_TOKENS: LazyLock<Mutex<HashMap<&'static str, String>>> = LazyLock::new(Default::default);

/// Cancels the sign-in in progress, if any.
static CANCEL_SIGN_IN: Mutex<Option<oneshot::Sender<()>>> = Mutex::new(None);

static HTTP: LazyLock<Client> = LazyLock::new(|| {
    Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent(concat!("ChaTOR/", env!("CARGO_PKG_VERSION")))
        .build()
        .expect("HTTP client")
});

/// The one place that picks the API, for Rust and (through `get_api_base`) the frontend:
/// production, except when running against the dev server (`tauri dev`, the same condition
/// that makes the frontend a dev build) with the "Use production API" developer setting off.
fn api_base() -> &'static str {
    if tauri::is_dev() && !production_selected() { LOCAL_API } else { PRODUCTION_API }
}

#[cfg(not(test))]
fn production_selected() -> bool {
    crate::dal::db::settings::get_settings().app.use_production_api
}

/// Tests have no settings loaded and run against a local API.
#[cfg(test)]
fn production_selected() -> bool {
    false
}

#[tauri::command]
pub fn get_api_base() -> &'static str {
    api_base()
}

/// The developer toggle. Saved with the settings, so it survives restarts and reloads.
#[tauri::command]
pub fn set_use_production_api(enabled: bool) -> &'static str {
    let mut settings = crate::dal::db::settings::get_settings();
    settings.app.use_production_api = enabled;
    crate::dal::db::settings::update_settings(settings);
    info!("API: {}", api_base());
    api_base()
}

/// Production and local servers issue different sessions, so each has its own entry.
fn keyring_user() -> &'static str {
    if api_base() == PRODUCTION_API { "session" } else { "session-local-dev" }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Identity {
    provider: String,
    display_name: Option<String>,
    avatar_url: Option<String>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Account {
    account_id: String,
    created_at: String,
    identities: Vec<Identity>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BanInfo {
    reason: String,
    expires_at: Option<String>
}

#[derive(Serialize, Debug)]
#[serde(tag = "state", rename_all = "snake_case")]
pub enum AuthStatus {
    SignedOut,
    /// `persisted`: false when the session could only be kept for this run.
    SignedIn { account: Account, persisted: bool },
    /// Signed in, but the server could not be reached.
    Offline,
    Banned { ban: BanInfo }
}

/// What a failed command reports to the UI. `code` is the API's error code, or one of
/// "network", "cancelled", "timeout", "listener", "browser", "invalid_response".
#[derive(Serialize, Deserialize, Debug)]
pub struct AuthError {
    code: String,
    message: String,
    #[serde(default)]
    ban: Option<BanInfo>
}

impl AuthError {

    fn new(code: &str, message: impl Into<String>) -> Self {
        Self { code: code.into(), message: message.into(), ban: None }
    }

    fn network(e: reqwest::Error) -> Self {
        warn!("ChaTOR API request failed: {}", e.without_url());
        Self::new("network", "Could not reach the ChaTOR server. Check your connection and try again.")
    }

}

/// The API's error body ({code, message, ban?}), or a generic error for anything else.
async fn api_error(response: reqwest::Response) -> AuthError {

    let status = response.status();
    match response.json::<AuthError>().await {
        Ok(error) => error,
        Err(_) => AuthError::new("invalid_response", format!("The ChaTOR server answered {}.", status))
    }

}

// ----- Token storage -------------------------------------------------------------------------

/// Credential store calls can block (D-Bus on Linux), so they run on the blocking pool.
async fn blocking<T: Send + 'static>(work: impl FnOnce() -> T + Send + 'static) -> T {
    tokio::task::spawn_blocking(work).await.expect("credential store task panicked")
}

async fn load_token() -> Option<String> {

    let user = keyring_user();
    if let Some(token) = MEMORY_TOKENS.lock().unwrap().get(user) {
        return Some(token.clone());
    }

    blocking(move || {
        match keyring::Entry::new(KEYRING_SERVICE, user).and_then(|entry| entry.get_password()) {
            Ok(token) => Some(token),
            Err(keyring::Error::NoEntry) => None,
            Err(e) => {
                warn!("Unable to read the session from the credential store: {}", e);
                None
            }
        }
    }).await

}

/// Returns whether the token was persisted (else it is kept in memory for this run).
async fn save_token(token: String) -> bool {

    let user = keyring_user();
    let stored = {
        let token = token.clone();
        blocking(move || keyring::Entry::new(KEYRING_SERVICE, user).and_then(|entry| entry.set_password(&token))).await
    };

    match stored {
        Ok(()) => {
            MEMORY_TOKENS.lock().unwrap().remove(user);
            true
        },
        Err(e) => {
            warn!("Unable to save the session to the credential store, keeping it for this run only: {}", e);
            MEMORY_TOKENS.lock().unwrap().insert(user, token);
            false
        }
    }

}

async fn clear_token() {

    let user = keyring_user();
    MEMORY_TOKENS.lock().unwrap().remove(user);
    let result = blocking(move || keyring::Entry::new(KEYRING_SERVICE, user).and_then(|entry| entry.delete_credential())).await;
    if let Err(e) = result {
        if !matches!(e, keyring::Error::NoEntry) {
            warn!("Unable to remove the session from the credential store: {}", e);
        }
    }

}

fn is_persisted() -> bool {
    !MEMORY_TOKENS.lock().unwrap().contains_key(keyring_user())
}

// ----- Status / sign out ---------------------------------------------------------------------

async fn fetch_account(token: &str) -> Result<Account, AuthError> {

    let response = HTTP.get(format!("{}/v1/account/me", api_base()))
        .bearer_auth(token)
        .send()
        .await
        .map_err(AuthError::network)?;

    if !response.status().is_success() {
        return Err(api_error(response).await);
    }

    response.json().await.map_err(|_| AuthError::new("invalid_response", "Unexpected answer from the ChaTOR server."))

}

/// Checks the stored session with the server. A rejected session is removed.
#[tauri::command]
pub async fn auth_status() -> AuthStatus {

    let Some(token) = load_token().await else {
        return AuthStatus::SignedOut;
    };

    match fetch_account(&token).await {
        Ok(account) => AuthStatus::SignedIn { account, persisted: is_persisted() },
        Err(e) if e.code == "unauthorized" => {
            info!("Stored session is no longer valid; signing out");
            clear_token().await;
            AuthStatus::SignedOut
        },
        Err(AuthError { ban: Some(ban), .. }) => {
            clear_token().await;
            AuthStatus::Banned { ban }
        },
        Err(_) => AuthStatus::Offline
    }

}

/// Ends this session (or all of the account's sessions) on the server, then forgets it here.
/// The local session is removed even when the server cannot be reached.
#[tauri::command]
pub async fn auth_sign_out(all: bool) -> AuthStatus {

    if let Some(token) = load_token().await {
        let result = HTTP.post(format!("{}/v1/auth/sign_out", api_base()))
            .bearer_auth(&token)
            .json(&serde_json::json!({ "all": all }))
            .send()
            .await;
        match result {
            Ok(response) if response.status().is_success() || response.status() == StatusCode::UNAUTHORIZED => {},
            Ok(response) => warn!("Sign out answered {}", response.status()),
            Err(e) => warn!("Sign out request failed: {}", e.without_url())
        }
    }

    clear_token().await;
    AuthStatus::SignedOut

}

// ----- Sign in -------------------------------------------------------------------------------

#[derive(Deserialize)]
struct StartResponse {
    flow_id: String,
    flow_secret: String,
    authorize_url: String,
    expires_in: u64
}

#[derive(Deserialize)]
struct NewSession {
    session_token: String
}

/// What the browser brought back to the listener.
enum Callback {
    Ticket(String),
    Failed(String)
}

#[tauri::command]
pub fn auth_cancel_sign_in() {
    if let Some(cancel) = CANCEL_SIGN_IN.lock().unwrap().take() {
        let _ = cancel.send(());
    }
}

#[tauri::command]
pub async fn auth_sign_in(app: AppHandle) -> Result<AuthStatus, AuthError> {

    // A second click restarts sign-in; the first attempt ends as cancelled.
    auth_cancel_sign_in();
    let (cancel_tx, cancel_rx) = oneshot::channel();
    *CANCEL_SIGN_IN.lock().unwrap() = Some(cancel_tx);

    let result = sign_in(cancel_rx, |url| open::that_detached(url)).await;

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.set_focus();
    }

    let token = result?;
    let persisted = save_token(token.clone()).await;
    let account = fetch_account(&token).await?;
    info!("Signed in (account {})", account.account_id);
    Ok(AuthStatus::SignedIn { account, persisted })

}

/// `open_browser` opens Discord's consent page (a parameter so tests can stand in for the
/// browser).
async fn sign_in(cancel: oneshot::Receiver<()>, open_browser: impl FnOnce(&str) -> std::io::Result<()>) -> Result<String, AuthError> {

    info!("Signing in through {}", api_base());
    let listener = TcpListener::bind(("127.0.0.1", 0)).await.map_err(|e| {
        warn!("Unable to open the sign-in listener: {}", e);
        AuthError::new("listener", "Could not open a local port for sign-in.")
    })?;
    let port = listener.local_addr().map_err(|_| AuthError::new("listener", "Could not open a local port for sign-in."))?.port();

    let response = HTTP.post(format!("{}/v1/auth/discord/start", api_base()))
        .json(&serde_json::json!({ "redirect_port": port }))
        .send()
        .await
        .map_err(AuthError::network)?;
    if !response.status().is_success() {
        return Err(api_error(response).await);
    }
    let flow: StartResponse = response.json()
        .await
        .map_err(|_| AuthError::new("invalid_response", "Unexpected answer from the ChaTOR server."))?;

    if !flow.authorize_url.starts_with(DISCORD_AUTHORIZE) {
        warn!("Refusing to open a sign-in URL that is not Discord's");
        return Err(AuthError::new("invalid_response", "Unexpected sign-in address from the ChaTOR server."));
    }
    open_browser(&flow.authorize_url).map_err(|e| {
        warn!("Unable to open the browser: {}", e);
        AuthError::new("browser", "Could not open your web browser.")
    })?;

    let deadline = Duration::from_secs(flow.expires_in.clamp(60, 900));
    let callback = tokio::select! {
        callback = wait_for_callback(&listener, &flow.flow_id) => callback,
        _ = cancel => return Err(AuthError::new("cancelled", "Sign-in cancelled.")),
        _ = tokio::time::sleep(deadline) => return Err(AuthError::new("timeout", "Sign-in timed out. Please try again."))
    };
    drop(listener);

    let ticket = match callback {
        Callback::Ticket(ticket) => Some(ticket),
        Callback::Failed(code) => {
            info!("Sign-in failed in the browser: {}", code);
            None
        }
    };

    // Without a ticket this asks the server why the flow failed (e.g. the ban reason).
    let response = HTTP.post(format!("{}/v1/auth/token", api_base()))
        .json(&serde_json::json!({
            "flow_id": flow.flow_id,
            "flow_secret": flow.flow_secret,
            "ticket": ticket,
            "device_name": format!("ChaTOR on {}", std::env::consts::OS)
        }))
        .send()
        .await
        .map_err(AuthError::network)?;
    if !response.status().is_success() {
        return Err(api_error(response).await);
    }

    let session: NewSession = response.json()
        .await
        .map_err(|_| AuthError::new("invalid_response", "Unexpected answer from the ChaTOR server."))?;
    Ok(session.session_token)

}

/// Serves the listener until a request for /callback with our flow id arrives. Anything else
/// (favicon, a stray request) gets a 404 and is ignored.
async fn wait_for_callback(listener: &TcpListener, flow_id: &str) -> Callback {

    loop {
        let Ok((stream, _)) = listener.accept().await else {
            continue;
        };

        match tokio::time::timeout(Duration::from_secs(5), handle_connection(stream, flow_id)).await {
            Ok(Some(callback)) => return callback,
            _ => continue
        }
    }

}

async fn handle_connection(mut stream: TcpStream, flow_id: &str) -> Option<Callback> {

    let mut buffer = vec![0u8; 8192];
    let mut read = 0;
    while read < buffer.len() {
        let n = stream.read(&mut buffer[read..]).await.ok()?;
        if n == 0 {
            break;
        }
        read += n;
        if buffer[..read].windows(4).any(|w| w == b"\r\n\r\n") {
            break;
        }
    }

    let callback = parse_callback(&buffer[..read], flow_id);
    let (status, title, text) = match &callback {
        Some(Callback::Ticket(_)) => ("200 OK", "You're signed in", "You can close this tab and go back to ChaTOR."),
        Some(Callback::Failed(code)) if code == "cancelled" => ("200 OK", "Sign-in cancelled", "You can close this tab."),
        Some(Callback::Failed(_)) => ("200 OK", "Sign-in failed", "Go back to ChaTOR for details."),
        None => ("404 Not Found", "Not found", "")
    };

    let _ = stream.write_all(callback_page(status, title, text).as_bytes()).await;
    let _ = stream.shutdown().await;
    callback

}

fn parse_callback(request: &[u8], flow_id: &str) -> Option<Callback> {

    let request = std::str::from_utf8(request).ok()?;
    let target = request.strip_prefix("GET ")?.split(' ').next()?;
    let url = Url::parse(&format!("http://127.0.0.1{}", target)).ok()?;
    if url.path() != "/callback" {
        return None;
    }

    let mut flow = None;
    let mut ticket = None;
    let mut error = None;
    for (key, value) in url.query_pairs() {
        match key.as_ref() {
            "flow" => flow = Some(value.into_owned()),
            "ticket" => ticket = Some(value.into_owned()),
            "error" => error = Some(value.into_owned()),
            _ => {}
        }
    }

    if flow.as_deref() != Some(flow_id) {
        return None;
    }

    match (ticket, error) {
        (Some(ticket), None) if !ticket.is_empty() && ticket.len() <= 128 => Some(Callback::Ticket(ticket)),
        (_, Some(error)) => Some(Callback::Failed(error.chars().filter(|c| c.is_ascii_alphanumeric() || *c == '_').take(32).collect())),
        _ => None
    }

}

fn callback_page(status: &str, title: &str, text: &str) -> String {

    let body = format!(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>ChaTOR</title>\
         <style>body{{font-family:system-ui,sans-serif;background:#0d1626;color:#dce7f5;display:flex;\
         min-height:100vh;margin:0;align-items:center;justify-content:center}}\
         main{{max-width:28rem;padding:2rem;border:1px solid #2a4a6b;border-radius:8px;background:#13213a}}\
         h1{{font-size:1.25rem;color:#7fd3ff;margin-top:0}}</style></head>\
         <body><main><h1>{}</h1><p>{}</p></main></body></html>",
        title, text
    );

    format!(
        "HTTP/1.1 {}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\n\
         Cache-Control: no-store\r\nReferrer-Policy: no-referrer\r\n\
         Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'\r\n\
         Connection: close\r\n\r\n{}",
        status,
        body.len(),
        body
    )

}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn parses_callbacks() {
        let ok = parse_callback(b"GET /callback?flow=abc&ticket=t1 HTTP/1.1\r\nHost: x\r\n\r\n", "abc");
        assert!(matches!(ok, Some(Callback::Ticket(t)) if t == "t1"));

        let failed = parse_callback(b"GET /callback?flow=abc&error=banned HTTP/1.1\r\n\r\n", "abc");
        assert!(matches!(failed, Some(Callback::Failed(c)) if c == "banned"));

        let sanitized = parse_callback(b"GET /callback?flow=abc&error=%3Cscript%3E HTTP/1.1\r\n\r\n", "abc");
        assert!(matches!(sanitized, Some(Callback::Failed(c)) if c == "script"));

        assert!(parse_callback(b"GET /callback?flow=other&ticket=t1 HTTP/1.1\r\n\r\n", "abc").is_none());
        assert!(parse_callback(b"GET /favicon.ico HTTP/1.1\r\n\r\n", "abc").is_none());
        assert!(parse_callback(b"POST /callback?flow=abc&ticket=t1 HTTP/1.1\r\n\r\n", "abc").is_none());
        assert!(parse_callback(b"\xff\xfe", "abc").is_none());
    }

    /// Full sign-in against a local rpc-web-service-v2 on :6578 whose Discord calls go to a
    /// stand-in (debug build, RPC_DISCORD_API_URL) that signs in "alice" for code "alice".
    /// Plays the browser: follows the API's callback redirect to the app's listener.
    #[tokio::test]
    #[ignore]
    async fn sign_in_against_local_api() {
        let (_cancel, cancel_rx) = oneshot::channel();

        let token = sign_in(cancel_rx, |authorize_url| {
            let url = Url::parse(authorize_url).unwrap();
            let state = url.query_pairs().find(|(k, _)| k == "state").unwrap().1.into_owned();
            tokio::spawn(async move {
                let browser = Client::builder().redirect(reqwest::redirect::Policy::none()).build().unwrap();
                let callback = Url::parse_with_params(&format!("{}/v1/auth/discord/callback", LOCAL_API), &[("code", "alice"), ("state", state.as_str())]).unwrap();
                let response = browser.get(callback).send().await.unwrap();
                let location = response.headers()["location"].to_str().unwrap().to_string();
                assert!(location.starts_with("http://127.0.0.1:"), "{}", location);
                let page = browser.get(location).send().await.unwrap().text().await.unwrap();
                assert!(page.contains("signed in"));
            });
            Ok(())
        }).await.unwrap();

        let account = fetch_account(&token).await.unwrap();
        assert_eq!(account.identities[0].display_name.as_deref(), Some("Alice"));
    }

}
