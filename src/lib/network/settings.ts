
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api";

export interface IChatSettings {
    confirmation_before_posting: boolean;
    enter_to_post: boolean;
    clear_chat_after_posting: boolean;
}

export interface ISettings {
    chat: IChatSettings;
}

function default_settings(): ISettings {

    return {

        chat: {
            confirmation_before_posting: true,
            enter_to_post: false,
            clear_chat_after_posting: false
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