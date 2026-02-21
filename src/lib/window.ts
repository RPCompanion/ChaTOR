import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useAppStore } from "../store/useAppStore";

const appWindow = getCurrentWebviewWindow();

export async function init_window_events(): Promise<() => void> {
    const unlistenResize = await appWindow.onResized((event) => {
        useAppStore.getState().updateSettings((draft) => {
            draft.app.window.width = event.payload.width;
            draft.app.window.height = event.payload.height;
        });
    });

    const unsub = init_window_decoration();

    return () => {
        unlistenResize();
        unsub();
    };
}

function init_window_decoration(): () => void {
    return useAppStore.subscribe(
        (state) => state.settings.app.show_window_decorations,
        (show) => {
            if (show) {
                appWindow.setDecorations(true);
            } else {
                appWindow.setDecorations(false);
            }
        }
    );
}
