
import { invoke } from "@tauri-apps/api/core";
import { refresh_auth } from "./api/account";
import { init_servers } from "./api/system";
import { Result, Ok, Err } from "./result";
import { useAccountStore } from "../store/useAccountStore";

const PRODUCTION_API_URL = "https://api.rpcompanion.com";
const LOCAL_API_URL = "http://localhost:6578";
const USE_PRODUCTION_API_KEY = "use_production_api";

/**
 * Release frontends always use production. Dev frontends (`vite`, `npm run tauri dev`) use the
 * local server unless the "Use production API" developer setting is on (kept in localStorage,
 * so it is known before the settings arrive from Tauri).
 */
export function uses_production_api(): boolean {
    if (import.meta.env.PROD) {
        return true;
    }
    try {
        return localStorage.getItem(USE_PRODUCTION_API_KEY) === "true";
    } catch {
        return false;
    }
}

/** Switches the API base. Each server has its own sign-in, so the account status is reloaded. */
export function set_uses_production_api(enabled: boolean) {
    try {
        localStorage.setItem(USE_PRODUCTION_API_KEY, String(enabled));
    } catch {}
    useAccountStore.getState().setAuth({ state: "unknown" });
    init_api();
}

export function api_url(): string {
    return uses_production_api() ? PRODUCTION_API_URL : LOCAL_API_URL;
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

export function init_api() {
    // Sign-in requests are made by Rust (src-tauri/src/auth.rs), which needs the same target.
    // Release builds ignore it there and always use production.
    invoke("set_api_target", { production: uses_production_api() })
        .then(refresh_auth)
        .catch(console.log);
    init_servers();
}