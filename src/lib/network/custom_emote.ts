
import { toast } from "@zerodevx/svelte-toast";
import { writable } from "svelte/store";
import { invoke } from "@tauri-apps/api";

export interface ICustomEmote {
    custom_emote_id: number;
    emote_name: string,
    emote: string
}

export const custom_emotes = writable<ICustomEmote[]>([]);

export function init_custom_emotes() {

    invoke("get_all_custom_emotes").then((response: any) => {
        custom_emotes.set(response);
    });

}

export function create_custom_emote(emote_name: string, emote: string) {

    invoke("create_custom_emote", { emoteName: emote_name, emote: emote }).then((response: any) => {

        console.log(response)
        custom_emotes.update((current) => {
            return [...current, response];
        });

    })
    .catch((error) => {
        console.log(error);
    });

}

export function delete_custom_emote(custom_emote_id: number) {

    invoke("delete_custom_emote", { customEmoteId: custom_emote_id }).then(() => {

        custom_emotes.update((current) => {
            return current.filter((emote) => emote.custom_emote_id != custom_emote_id);
        });

    });

}

export function update_custom_emote(custom_emote: ICustomEmote) {
    
    invoke("update_custom_emote", { customEmote: custom_emote }).then(() => {

        custom_emotes.update((current) => {

            return current.map((emote) => {

                if (emote.custom_emote_id == custom_emote.custom_emote_id) {
                    return custom_emote;
                } else {
                    return emote;
                }

            });

        });

    }).catch((error: string) => {
        toast.push(error);
        init_custom_emotes();
    });

}

