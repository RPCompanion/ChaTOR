
import { writable, get } from "svelte/store";
import { API_ENDPOINTS } from "../api";

export interface IServer {
    server_id: number;
    name: string;
}

export const servers = writable<IServer[]>([]);

export async function init_servers() {

    let request = new Request(API_ENDPOINTS.system.servers.url, {
        method: API_ENDPOINTS.system.servers.type
    });

    try {

        let response = await fetch(request);
        if (!response.ok) {
            return;
        }

        servers.set(await response.json());

    } catch (e) {
        console.log(e);
    }

}