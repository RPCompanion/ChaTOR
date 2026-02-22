import { toast } from "react-toastify";
import { invoke } from "@tauri-apps/api/core";
import { useEmoteStore } from "../../store/useEmoteStore";

export interface ICustomEmote {
    custom_emote_id: number;
    emote_name: string,
    emote: string;
    favourite: boolean;
    order_index: number;
}

export function get_next_order_index(favourite: boolean): number {
    const emotes = useEmoteStore.getState().customEmotes;
    const filtered = emotes
        .filter((emote) => emote.favourite === favourite)
        .sort((a, b) => a.order_index - b.order_index);

    if (filtered.length > 0) {
        return filtered.at(-1)!.order_index + 1;
    }
    return 0;
}

export function init_custom_emotes() {
    invoke("get_all_custom_emotes").then((response: any) => {
        useEmoteStore.getState().setCustomEmotes(response);
    });
}

export function create_custom_emote(emote_name: string, emote: string) {
    invoke("create_custom_emote", {
        emoteName: emote_name,
        emote: emote,
        orderIndex: get_next_order_index(false)
    }).then((response: any) => {
        useEmoteStore.getState().addCustomEmote(response);
    }).catch((error) => {
        console.log(error);
    });
}

export function delete_custom_emote(custom_emote_id: number) {
    invoke("delete_custom_emote", { customEmoteId: custom_emote_id }).then(() => {
        useEmoteStore.getState().deleteCustomEmote(custom_emote_id);
    });
}

export function update_custom_emote(custom_emote: ICustomEmote) {
    invoke("update_custom_emote", { customEmote: custom_emote }).then(() => {
        useEmoteStore.getState().updateCustomEmote(custom_emote);
    }).catch((error: string) => {
        toast.error(error);
        init_custom_emotes();
    });
}

export function update_custom_emotes_batch(t_custom_emotes: ICustomEmote[]) {
    invoke("update_custom_emotes_batch", { customEmotes: t_custom_emotes }).then(() => {
        init_custom_emotes();
    }).catch((error: string) => {
        toast.error(error);
        init_custom_emotes();
    });
}
