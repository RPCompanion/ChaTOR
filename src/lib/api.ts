
import { invoke } from "@tauri-apps/api/core";
import { refresh_auth } from "./api/account";
import { init_servers } from "./api/system";
import type { IBan } from "./api/account";
import { useAccountStore } from "../store/useAccountStore";
import { useAppStore } from "../store/useAppStore";

// The webview never calls the rpcompanion API itself: every request is a Tauri command in
// src-tauri/src/api.rs (or auth.rs for sign-in), which also picks the server: production, or the
// local one when running under `tauri dev` with the "Use production API" developer setting off.

/** How a failed API command rejects. */
export interface IApiError {
    code: string;
    message: string;
    ban?: IBan | null;
}

/** The message of a rejected API command, for a toast or an error line. */
export function api_error_message(e: unknown): string {
    return (e as IApiError)?.message ?? String(e);
}

/** The developer toggle. Each server has its own sign-in, so the account status is reloaded. */
export async function set_uses_production_api(enabled: boolean) {
    // Keeps the settings store in step, so its next save does not switch it back.
    useAppStore.getState().updateSettings((draft) => { draft.app.use_production_api = enabled; });
    useAccountStore.getState().setAuth({ state: "unknown" });
    try {
        useAccountStore.getState().setApiBase(await invoke<string>("set_use_production_api", { enabled }));
    } catch (e) {
        console.log(e);
    }
    refresh_auth();
    init_servers();
}

export async function init_api() {
    try {
        useAccountStore.getState().setApiBase(await invoke<string>("get_api_base"));
    } catch (e) {
        console.log(e);
    }
    refresh_auth();
    init_servers();
}
