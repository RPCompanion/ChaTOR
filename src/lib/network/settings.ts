
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api";
import { toast } from "@zerodevx/svelte-toast";
import { hooked_in } from "../network";

export interface IChatSettings {
    confirmation_before_posting: boolean;
    enter_to_post: boolean;
    clear_chat_after_posting: boolean;
    remove_starting_pronouns: boolean;
    starting_characters_are_lowercase: boolean;
}

export interface IChatLogSettings {
    capture_chat_log: boolean;
    character_ini_to_pull_from?: string;
}

export interface ISettings {
    chat: IChatSettings;
    chat_log: IChatLogSettings;
}

export function default_settings(): ISettings {

    return {

        chat: {
            confirmation_before_posting: true,
            enter_to_post: false,
            clear_chat_after_posting: false,
            remove_starting_pronouns: false,
            starting_characters_are_lowercase: true
        },
        chat_log: {
            capture_chat_log: false,
            character_ini_to_pull_from: undefined
        }

    }

}

export const settings = writable<ISettings>(default_settings());
export const chat_log_active = writable<boolean>(false);

export function init_settings() {

    invoke("get_settings").then((response: any) => {

        settings.set(response);
        settings.subscribe((value) => {
            invoke("update_settings", {settings: value});
        });
        chat_log_subscriber();

    });

}

function chat_log_subscriber() {

    settings.subscribe((value) => {

        let t_chat_log_active = get(chat_log_active);
        if (value.chat_log.capture_chat_log && !t_chat_log_active) {

            invoke("start_injecting_capture")
                .then(() => {
                    toast.push("Chat logging active");
                    chat_log_active.set(true);
                })
                .catch((e) => {
                    toast.push("Failed to start chat log capture: " + e);  
                });

        } else {

            invoke("stop_injecting_capture");
            chat_log_active.set(false);

        }

    });

    hooked_in.subscribe((t_hooked_in) => {

        let t_chat_log_active = get(chat_log_active);
        let t_settings = get(settings);
        
        if (t_hooked_in && t_chat_log_active) { 
            return;
        } else if (t_hooked_in && !t_chat_log_active && t_settings.chat_log.capture_chat_log) {
            invoke("start_injecting_capture").catch(() => {});
        } else if (!t_hooked_in && t_chat_log_active) {
            invoke("stop_injecting_capture").catch(() => {});
            chat_log_active.set(false);
        }

    });

}