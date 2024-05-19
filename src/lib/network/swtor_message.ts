
import { get, writable } from "svelte/store";
import { listen } from "@tauri-apps/api/event";
import { Channel } from "./swtor_channel";

export class SwtorMessage {

    public readonly channel: Channel;
    public readonly timestamp: string;
    public readonly from: string;
    public readonly to: string;
    public readonly message: string;
    
    constructor(swtor_message: ISwtorMessage) {

        this.channel   = new Channel(swtor_message.channel);
        this.timestamp = new Date(swtor_message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit"});
        this.from      = swtor_message.from;
        this.to        = swtor_message.to;
        this.message   = swtor_message.message;

    }

}

export interface ISwtorMessage {
    channel: number;
    timestamp: string;
    from: string;
    to: string;
    message: string;
}

export const swtor_messages = writable<SwtorMessage[]>([]);

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let temp = get(swtor_messages);
        let payload: ISwtorMessage[] = messages.payload;

        payload.forEach((message) => {

            message.message = message.message
                .replaceAll("&quot;", "\"")
                .replaceAll("&gt;", ">")
                .replaceAll("&lt;", "<");

        });

        let objs = payload.map((message) => new SwtorMessage(message));
        swtor_messages.set(temp.concat(objs));

    });

}