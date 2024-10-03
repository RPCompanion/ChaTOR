
import { init_account } from "./api/account";
import { init_servers } from "./api/system";
import { Result, Ok, Err } from "./result";

const API_URL = import.meta.env.PROD ? "https://apiv2.rpcompanion.com" : "http://localhost:6578";

export const API_ENDPOINTS = {

    third_party: {
        discord_beacons: {
            star_forge:  {
                url: `${API_URL}/third_party/discord_beacons/star_forge`,
                type: "GET"
            }
        }
    },
    account: {
        create: {
            url: `${API_URL}/account/create`,
            type: "POST"
        },
        login: {
            url: `${API_URL}/account/login`,
            type: "POST"
        },
    },
    character: {
        create: {
            url: `${API_URL}/character/create`,
            type: "POST"
        },
        delete: {
            url: `${API_URL}/character/delete`,
            type: "DELETE"
        },
        update: {
            url: `${API_URL}/character/update`,
            type: "PUT"
        },
        template: {
            url: `${API_URL}/character/template/{template_id}`,
            type: "GET"
        },
        templates: {
            url: `${API_URL}/character/templates`,
            type: "GET"
        },
    },
    system: {
        servers: {
            url: `${API_URL}/system/servers`,
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