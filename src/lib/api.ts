
import { Result, Ok, Err } from "./result";

const WEBSITE_URL = "https://apiv2.rpcompanion.com"
export const API_ENDPOINTS = {

    third_party: {
        discord_beacons: {
            star_forge:  {
                url: `${WEBSITE_URL}/third_party/discord_beacons/star_forge`,
                type: "GET"
            }
        }
    }

};

export interface IGenericAPIError {
    message: string;
}

// This function could throw a exception if the fetch fails; it's up to the caller to handle it.
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