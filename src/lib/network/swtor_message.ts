
import { get, writable } from "svelte/store";
import { settings } from "./settings";
import { listen } from "@tauri-apps/api/event";
import { Channel } from "./swtor_channel";
import { add_swtor_channel_message } from "./swtor_message/swtor_chat_tab_messages";

export class SwtorMessage {

    public readonly channel: Channel;
    public readonly timestamp: string;
    public readonly from: string;
    public readonly to: string;
    public readonly message: string;
    public read: boolean = false;
    
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

function replace_html_entities(payload: ISwtorMessage[]) {

    payload.forEach((message) => {

        message.message = message.message
            .replaceAll("&quot;", "\"")
            .replaceAll("&gt;", ">")
            .replaceAll("&lt;", "<")
            .replaceAll("&amp;", "&")
            .replaceAll("&apos;", "'");

    });

}

function replace_html_tags(payload: ISwtorMessage[]) {

    if (get(settings).chat_log.window.show_unknown_ids) {
        return;
    }

    const re: RegExp = /<HL LID="([^"]+)">/g;
    payload.forEach((message) => {

        for (let obj of message.message.matchAll(re)) {
            message.message = message.message.replace(obj[0], "");
        }

    });

}

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let payload: ISwtorMessage[] = messages.payload;

        replace_html_entities(payload);
        replace_html_tags(payload);
      
        payload.map((message) => new SwtorMessage(message)).forEach((message) => {
            add_swtor_channel_message(message);
        });            

    });

}