
import { invoke } from "@tauri-apps/api";
import { API_ENDPOINTS } from "../api";
import { toast } from "@zerodevx/svelte-toast";

type PatchNotes = {
    additions?: string[];
    changes?: string[];
    bugfixes?: string[];
}

type ChatorVersion = {
    create_time: string;
    major: number;
    minor: number;
    patch: number;
    patch_notes: PatchNotes;
}

export async function chator_check_latest_version() {

    let request = new Request(API_ENDPOINTS.chator.latest_version.url, {
        method: API_ENDPOINTS.chator.latest_version.type,
        headers: {
            "Content-Type": "application/json"
        }
    })

    let response: Response;
    try {
        response = await fetch(request);
    } catch (e) {
        return;
    }

    if (!response.ok) {
        return;
    }

    let data: ChatorVersion = await response.json();
    let version: number[] = (await invoke("get_version") as string)
        .split(".")
        .map((v) => parseInt(v));

    if (version[0] != data.major || version[1] != data.minor || version[2] != data.patch) {
        toast.push(`A new version of Chator v${data.major}.${data.minor}.${data.patch} is available! Download at Itch.io or Discord`);
    }

}