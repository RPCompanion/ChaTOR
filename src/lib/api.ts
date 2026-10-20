
import { invoke } from "@tauri-apps/api/core";
import { refresh_auth } from "./api/account";
import { init_servers } from "./api/system";
import { Result, Ok, Err } from "./result";
import { useAccountStore } from "../store/useAccountStore";
import { useAppStore } from "../store/useAppStore";

/**
 * Rust picks the API (src-tauri/src/auth.rs, api_base) and the frontend uses the same one:
 * production, or the local server when running under `tauri dev` with the "Use production API"
 * developer setting off. That setting lives in the app settings, not in the webview.
 */
export function api_url(): string {
    return useAccountStore.getState().apiBase;
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

// The base is read on every access, so switching servers needs no reload.
function endpoint(path: string, type: string) {
    return {
        get url() { return `${api_url()}${path}`; },
        type
    };
}

// Every endpoint carries its own version (/v1/...): a breaking change to one endpoint moves
// just that entry to /v2/..., the rest stay as they are.
export const API_ENDPOINTS = {

    third_party: {
        discord_beacons: {
            star_forge:  endpoint("/v1/third_party/discord_beacons/star_forge", "GET")
        }
    },
    character: {
        template: endpoint("/v1/character/template/{template_id}", "GET"),
        templates: endpoint("/v1/character/templates", "GET"),
    },
    system: {
        servers: endpoint("/v1/system/servers", "GET")
    }
    
};

export interface IGenericAPIError {
    message: string;
}

/** 
 * This function could throw a exception if the fetch fails; it's up to the caller to handle it.
 */
export async function http_get<T, E>(endpoint: string | Request): Promise<Result<T, E>> {

    let request: Request;
    if (typeof endpoint === "string") {

        request = new Request(endpoint, {
            method: "GET"
        });

    } else {

        request = endpoint;

    }

    let response: Response = await fetch(request);

    if (response.ok) {

        let data: T = await response.json();
        return Ok(data);

    } else {

        let data: E = await response.json();
        return Err(data);

    }

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