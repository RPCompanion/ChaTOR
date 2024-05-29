
import { appWindow } from "@tauri-apps/api/window";
import { settings } from "./network/settings";
 
export async function init_window_events() {

    await appWindow.onResized((event) => {

        settings.update((s) => {
            s.app.window.width = event.payload.width;
            s.app.window.height = event.payload.height;
            return s;
        })

    });

}