
import { get, writable } from "svelte/store";
import { listen } from "@tauri-apps/api/event";
import { type IColor, Color } from "./characters";

export interface ISwtorMessage {
    character_name: string;
    timestamp?: string;
    color: IColor;
    message: string;
}

export const swtor_messages = writable<ISwtorMessage[]>([]);

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let temp = get(swtor_messages);
        messages.payload.forEach((message: any) => {
            message.color = new Color(message.color.r, message.color.g, message.color.b);
        });
        temp.push(messages.payload);

        swtor_messages.set(temp);

    });

}