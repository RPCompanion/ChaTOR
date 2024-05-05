
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { writable, get } from "svelte/store";

import { Result } from "./result";

export const hooked_in = writable<boolean>(false);

export function init_hook() {

    invoke("start_swtor_hook");
    listen("swtor_hooked_in", (response: any) => {
        hooked_in.set(response.payload.hooked_in);
    });

}

export function submit_post(messages: string[]): Result<[], string> {

    if (get(hooked_in) == false) {
        return Result.error("SWTOR not hooked in");
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