import { useAccountStore } from "../../store/useAccountStore";
import { API_ENDPOINTS } from "../api";

export interface IServer {
    server_id: number;
    name: string;
}

export async function init_servers() {
    const request = new Request(API_ENDPOINTS.system.servers.url, {
        method: API_ENDPOINTS.system.servers.type,
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
            return;
        }
        useAccountStore.getState().setServers(await response.json());
    } catch (e) {
        console.log(e);
    }
}
