import { update_custom_emotes_batch, type ICustomEmote } from "./network/custom_emote";

export interface IDNDCustomEmote extends ICustomEmote {
    id: number;
}

export function get_relevant_emotes_from_list(emotes: ICustomEmote[], favourite: boolean): IDNDCustomEmote[] {

    return emotes
        .filter((e) => e.favourite == favourite)
        .sort((a, b) => a.order_index - b.order_index)
        .map((emote, index) => ({ ...emote, id: index }));

}

export function reorder_emotes_and_update(emotes: ICustomEmote[]) {

    emotes.forEach((emote, index) => {
        emote.order_index = index;
    });
    update_custom_emotes_batch(emotes);
    
}