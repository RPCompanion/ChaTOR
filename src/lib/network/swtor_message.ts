
import { get, writable } from "svelte/store";
import { listen } from "@tauri-apps/api/event";
import { Color, active_character } from "./characters";

export interface ISwtorMessage {
    character_name: string;
    timestamp?: string;
    color: Color;
    message: string;
}

export const swtor_messages = writable<ISwtorMessage[]>([]);

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let t_active_character = get(active_character);
        let temp = get(swtor_messages);

        let payload = messages.payload;
        payload.forEach((message: any) => {
            message.color = new Color(message.color.r, message.color.g, message.color.b);
        });

        let f_payload: ISwtorMessage[] = (payload as ISwtorMessage[])
            .filter((message) => t_active_character!.relevant_channel_color(message.color));

        swtor_messages.set(temp.concat(f_payload));

    });

}