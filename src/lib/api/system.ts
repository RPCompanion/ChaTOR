import { invoke } from "@tauri-apps/api/core";
import { useAccountStore } from "../../store/useAccountStore";

export interface IServer {
    server_id: number;
    name: string;
}

export async function init_servers() {
    try {
        useAccountStore.getState().setServers(await invoke<IServer[]>("get_servers"));
    } catch (e) {
        console.log(e);
    }
}
