
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { writable, get } from "svelte/store";

import { Result } from "./result";
import { init_custom_emotes } from "./network/custom_emote";
import { init_settings } from "./network/settings";

export const hooked_in = writable<boolean>(false);

export function init_network() {
    init_hook();
    init_custom_emotes();
    init_settings();
}

function init_hook() {

    invoke("start_swtor_hook");
    listen("swtor_hooked_in", (response: any) => {
        hooked_in.set(response.payload.hooked_in);
    });

}

export function submit_post(messages: string[]): Result<[], string> {

    if (!get(hooked_in)) {
        return Result.error("SWTOR not hooked in. Have you launched the game?");
    }

    messages = messages.map((message) => message.trim());
    
    for (let message of messages) { 
        
        if (message.length == 0) {
            return Result.error("Empty message detected. Please remove it.");
        } else if (message.length > 255) {
            return Result.error("Long message detected. Please shorten it.");
        }

    }

    interface NewCharacterMessage {
        messages: string[];
    }

    let character_message: NewCharacterMessage = {
        messages: messages
    };

    invoke("submit_actual_post", { characterMessage: character_message});
    return Result.ok([]);

}


export function open_link(link: string) {
    invoke("open_link", { link: link });
}