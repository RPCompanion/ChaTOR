

#[tauri::command]
pub fn is_hooked_in() -> bool {

    false

}

#[tauri::command]
pub fn start_swtor_hook(window: tauri::Window) {

    return;

    /*
    thread::spawn(move || {

        loop {

            hook_into_existing();

            window.emit("swtor_hooked_in", json!({
                "hooked_in": is_hooked_in(),
            })).unwrap();

            thread::sleep(Duration::from_millis(1000));

        }

    });
    */

}