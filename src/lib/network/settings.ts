
import { writable } from "svelte/store";
import { invoke } from "@tauri-apps/api";

export interface IChatSettings {
    confirmation_before_posting: boolean;
    enter_to_send: boolean;
}

export interface ISettings {
    chat: IChatSettings;
}

function default_settings(): ISettings {

    return {

        chat: {
            confirmation_before_posting: true,
            enter_to_send: false
        }

    }

}

export const settings = writable<ISettings>(default_settings());

export function init_settings() {

    invoke("get_settings").then((response: any) => {

        settings.set(response);
        settings.subscribe((value) => {
            invoke("update_settings", { settings: value });
        });

    });


}