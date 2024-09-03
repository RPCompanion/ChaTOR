
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { writable, get } from "svelte/store";

import { Result, Ok, Err } from "./result";
import { init_custom_emotes } from "./network/custom_emote";
import { init_settings } from "./network/settings";
import { init_swtor_message_listener } from "./network/swtor_message";
import { init_active_character } from "./network/characters";
import { settings } from "./network/settings";
import { init_custom_channels } from "./network/custom_channels";

export type MessageType = "ButtonEmote" | "ChatMessage";

interface UserCharacterMessages {
    message_type: MessageType;
    character_id?: number;
    messages: string[];
}

export const hooked_in = writable<boolean>(false);

type PostMessageResponse = 
    | "Success"
    | { Failed: string};

var submit_post_callback: ((result: Result<[], string>) => void) | undefined = undefined;

export function init_network() {

    init_settings(() => {
        init_active_character();
    });

    init_hook();
    init_submit_post_listener();
    init_swtor_message_listener();
    init_custom_emotes();
    init_custom_channels();

}

function init_hook() {

    invoke("start_swtor_hook");
    listen("swtor_hooked_in", (response: any) => {
        hooked_in.set(response.payload.hooked_in);
    });

}

function init_submit_post_listener() {

    listen("submit_post_response", (response) => {

        let payload: PostMessageResponse = response.payload as PostMessageResponse;

        if (submit_post_callback != undefined) {

            if (payload == "Success") {
                submit_post_callback(Ok([]));
            } else {
                submit_post_callback(Err((payload as { Failed: string }).Failed));
            }

            submit_post_callback = undefined;

        }

    });

}

export function submit_post(message_type: MessageType, messages: string[], callback: (result: Result<[], string>) => void) {

    if (!get(hooked_in)) {

        callback(Err("SWTOR not hooked in. Have you launched the game?"));
        return;

    }

    messages = messages.map((message) => message.trim());
    
    for (let message of messages) { 
        
        if (message.length == 0) {

            callback(Err("Empty message detected. Please remove it."));
            return;

        } else if (message.length > 255) {

            callback(Err("Long message detected. Please shorten it."));
            return;

        }

    }

    let character_message: UserCharacterMessages = {
        message_type: message_type,
        character_id: undefined,
        messages: messages
    };

    let t_settings = get(settings);
    let retry: boolean = t_settings.chat_log.retry_message_submission && t_settings.chat_log.capture_chat_log && message_type != "ButtonEmote";

    submit_post_callback = callback;
    invoke("submit_post", {retry: retry, characterMessage: character_message});

}


export function open_link(link: string) {
    invoke("open_link", { link: link });
}

export function fetch_content(url: string, callback: (result: Result<string, string>) => void) {

    invoke("fetch_content", { url })
        .then((response: any) => {
            callback(Ok(response as string));
        })
        .catch((error: any) => {
            callback(Err(error as string));
        });

}

export function fetch_jediapedia_content(global_id: string, url: string, callback: (result: Result<string, string>) => void) {

    invoke("fetch_jediapedia_content", { globalId: global_id, url })
        .then((response: any) => {
            callback(Ok(response as string));
        })
        .catch((error: any) => {
            callback(Err(error as string));
        });

}