
import { API_ENDPOINTS, http_get, type IGenericAPIError } from "../api";
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

    let star_forge_api = API_ENDPOINTS.third_party.discord_beacons.star_forge;

    let response;
    
    try {
        response = await http_get<IStarForgeBeacon[], IGenericAPIError>(star_forge_api.url);
    } catch(err) {
        return Err("Failed to fetch data from the server.")
    }

    if (response.is_error()) {
        return Err(response.unwrap_error().message);
    }

    return Ok(response.unwrap());

}