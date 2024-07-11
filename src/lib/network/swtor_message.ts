
import { get } from "svelte/store";
import { settings } from "./settings";
import { listen } from "@tauri-apps/api/event";
import { SwtorChannel, ESwtorChannel } from "./swtor_channel";
import { add_swtor_channel_message } from "./swtor_message/swtor_chat_tab_messages";
import { active_character } from "./characters";
import { add_player } from "./players";
import { 
    get_hyperlink_regex,
    parse_hyperlink, 
    type Hyperlink 
} from "../hyperlink_parser";

export type MessageFragment = string | Hyperlink;

export class SwtorMessage {

    public readonly channel: SwtorChannel;
    public readonly timestamp: string;
    public readonly from: string;
    public readonly to: string;
    public readonly message: string;
    public readonly message_fragments: MessageFragment[] = [];
    public read: boolean = false;
    
    constructor(swtor_message: ISwtorMessage) {

        this.channel   = new SwtorChannel(swtor_message.channel);
        this.timestamp = new Date(swtor_message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit"});
        this.from      = swtor_message.from;
        this.to        = swtor_message.to;
        this.message   = SwtorMessage.replace_html_entities(swtor_message.message);
        this.message_fragments = this.get_message_fragments();

    }

    private static replace_html_entities(message: string): string {

        return message
            .replaceAll("&quot;", "\"")
            .replaceAll("&gt;", ">")
            .replaceAll("&lt;", "<")
            .replaceAll("&amp;", "&")
            .replaceAll("&apos;", "'");

    }

    private get_message_fragments(): MessageFragment[] {

        return this.get_fragments_with_hyperlinks();

    }
    
    private get_fragments_with_unknown(): MessageFragment[] {

        let temp = this.message.slice(0);
        for (let obj of temp.matchAll(get_hyperlink_regex())) {
            temp = temp.replace(obj[0], "<Unknown>");
        }

        return [temp];

    }

    private get_fragments_with_hyperlinks(): MessageFragment[] {

        let start_idx: number = 0;
        let fragments: MessageFragment[] = [];
        for (let obj of this.message.matchAll(get_hyperlink_regex())) {
            
            if (obj.index != start_idx) {
                fragments.push(this.message.slice(start_idx, obj.index));
            }

            let result = parse_hyperlink(obj[0]);
            if (result.is_error()) {
                fragments.push("<Unknown>");
            } else {
                fragments.push(result.unwrap());
            }

            start_idx = obj.index + obj[0].length + 1;

        }

        if (start_idx < this.message.length) {
            fragments.push(this.message.slice(start_idx));
        }

        return fragments;

    }

    public get_message_from(): string {

        if (this.channel.type == ESwtorChannel.WHISPER && this.from == get(active_character)?.character_name) {
            return `[to ${this.to}]`;
        }

        if (this.channel.type == ESwtorChannel.CUSTOM_CHANNEL) {
            return `[${this.to.replace("Usr.", "")}] ${this.from}:`;
        }

        let channel_text = this.channel.get_name();
        if (channel_text.is_some()) {
            return `[${channel_text.unwrap()}] ${this.from}:`;
        }

        return this.from;

    }

}

export interface ISwtorMessage {
    channel: number;
    timestamp: string;
    from: string;
    to: string;
    message: string;
}

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let payload: ISwtorMessage[] = messages.payload;
      
        payload.map((message) => new SwtorMessage(message)).forEach((message) => {
            add_swtor_channel_message(message);
            add_player(message.from);
        });            

    });

}