
import { writable } from "svelte/store";
import { invoke } from "@tauri-apps/api";

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

export function init_settings() {

    invoke("get_settings").then((response: any) => {

        settings.set(response);
        settings.subscribe((value) => {
            invoke("update_settings", {settings: value});
        });

    });

}