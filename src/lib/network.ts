import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../store/useAppStore";
import { Result, Ok, Err } from "./result";
import { init_custom_emotes } from "./network/custom_emote";
import { init_settings } from "./network/settings";
import { init_swtor_message_listener } from "./network/swtor_message";
import { init_active_local_character } from "./network/local_characters";
import { init_custom_channels } from "./network/custom_channels";

export type MessageType = "ButtonEmote" | "ChatMessage";

interface UserCharacterMessages {
    message_type: MessageType;
    character_id?: number;
    messages: string[];
}

export async function init_network(): Promise<() => void> {
    const cleanupSettings = await init_settings(() => {
        init_active_local_character();
    });

    const cleanupHook = init_hook();
    init_swtor_message_listener();
    init_custom_emotes();
    init_custom_channels();

    return () => {
        cleanupSettings();
        cleanupHook();
    };
}

function init_hook(): () => void {
    invoke("start_swtor_hook");
    const unlisten = listen("swtor_hooked_in", (response: any) => {
        useAppStore.getState().setHookedIn(response.payload.hooked_in);
    });

    return () => {
        unlisten.then((fn) => fn());
    };
}

export async function submit_post(message_type: MessageType, messages: string[]): Promise<Result<[], string>> {
    if (!useAppStore.getState().hookedIn) {
        return Err("SWTOR not hooked in. Have you launched the game?");
    }

    const trimmed = messages.map((message) => message.trim());

    for (const message of trimmed) {
        if (message.length === 0) {
            return Err("Empty message detected. Please remove it.");
        } else if (message.length > 255) {
            return Err("Long message detected. Please shorten it.");
        }
    }

    const settings = useAppStore.getState().settings;
    const retry: boolean = settings.chat_log.retry_message_submission &&
        settings.chat_log.capture_chat_log &&
        message_type !== "ButtonEmote";

    const character_message: UserCharacterMessages = {
        message_type,
        character_id: undefined,
        messages: trimmed
    };

    try {
        await invoke("submit_post", { retry, characterMessage: character_message });
        return Ok([]);
    } catch (error: any) {
        return Err(error);
    }
}

export function open_link(link: string) {
    invoke("open_link", { link });
}

export function fetch_content(url: string, callback: (result: Result<string, string>) => void) {
    invoke("fetch_content", { url })
        .then((response: any) => callback(Ok(response as string)))
        .catch((error: any) => callback(Err(error as string)));
}

export function fetch_jediapedia_content(global_id: string, url: string, callback: (result: Result<string, string>) => void) {
    invoke("fetch_jediapedia_content", { globalId: global_id, url })
        .then((response: any) => callback(Ok(response as string)))
        .catch((error: any) => callback(Err(error as string)));
}
