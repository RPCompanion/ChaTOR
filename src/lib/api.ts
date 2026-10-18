
import { init_account } from "./api/account";
import { init_servers } from "./api/system";
import { Result, Ok, Err } from "./result";

// Every endpoint carries its own version (/v1/...): a breaking change to one endpoint moves
// just that entry to /v2/..., the rest stay as they are.
const API_URL = import.meta.env.PROD ? "https://api.rpcompanion.com" : "http://localhost:6578";

export const API_ENDPOINTS = {

    third_party: {
        discord_beacons: {
            star_forge:  {
                url: `${API_URL}/v1/third_party/discord_beacons/star_forge`,
                type: "GET"
            }
        }
    },
    account: {
        create: {
            url: `${API_URL}/v1/account/create`,
            type: "POST"
        },
        login: {
            url: `${API_URL}/v1/account/login`,
            type: "POST"
        },
    },
    character: {
        create: {
            url: `${API_URL}/v1/character/create`,
            type: "POST"
        },
        delete: {
            url: `${API_URL}/v1/character/delete`,
            type: "DELETE"
        },
        template: {
            url: `${API_URL}/v1/character/template/{template_id}`,
            type: "GET"
        },
        templates: {
            url: `${API_URL}/v1/character/templates`,
            type: "GET"
        },
    },
    system: {
        servers: {
            url: `${API_URL}/v1/system/servers`,
            type: "GET"
        }
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
    init_account();
    init_servers();
}