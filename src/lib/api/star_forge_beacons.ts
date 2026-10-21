
import { invoke } from "@tauri-apps/api/core";
import { api_error_message } from "../api";
import { Result, Ok, Err } from "../result";

export interface IStarForgeBeacon {
    avatar_url?: string;
    name: string;
    global_name?: string;
    create_time: string;
    message: string;
    attachments: string[];
}

export async function get_star_forge_beacons(): Promise<Result<IStarForgeBeacon[], string>> {

    try {
        return Ok(await invoke<IStarForgeBeacon[]>("get_star_forge_beacons"));
    } catch (e) {
        return Err(api_error_message(e));
    }

}
