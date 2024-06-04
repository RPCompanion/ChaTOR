
import { get, writable } from "svelte/store";
import { settings } from "./settings";
import { listen } from "@tauri-apps/api/event";
import { Channel, SwtorChannel } from "./swtor_channel";
import { add_swtor_channel_message } from "./swtor_message/swtor_chat_tab_messages";
import { active_character } from "./characters";
import { add_player } from "./players";

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
        this.message   = SwtorMessage.replace_html_tags(SwtorMessage.replace_html_entities(swtor_message.message));

    }

    private static replace_html_entities(message: string): string {

        return message
            .replaceAll("&quot;", "\"")
            .replaceAll("&gt;", ">")
            .replaceAll("&lt;", "<")
            .replaceAll("&amp;", "&")
            .replaceAll("&apos;", "'");

    }

    private static replace_html_tags(message: string): string {

        if (get(settings).chat_log.window.show_unknown_ids) {
            return message;
        }

        const re: RegExp = /<HL LID="([^"]+)">/g;
        for (let obj of message.matchAll(re)) {
            message = message.replace(obj[0], "<Unknown ID>");
        }

        return message;

    }

    public get_message_from(): string {

        if (this.channel.type == SwtorChannel.WHISPER && this.from == get(active_character)?.character_name) {
            return `[to ${this.to}]`;
        }

        let channel_text = this.channel.get_name();
        if (channel_text.is_some()) {
            return `[${channel_text.unwrap()}] ${this.from}:`;
        }

        return this.from;

    }

    /*
        This function will split the message into fragments, where each fragment is a string that
        starts with a quotation mark and ends with a quotation mark. This is useful for the chat
        log window, as it will allow us to highlight the text between the quotation marks as a
        different color.
    */
    public get_message_fragments(): string[] {

        // TODO, make this a toggle in the settings
        const COMPUTE_MESSAGE_FRAGMENTS: boolean = false;
        if (!COMPUTE_MESSAGE_FRAGMENTS) {
            return [this.message];
        }

        let idx = this.message.indexOf("\"");
        if (idx == -1) {
            return [this.message];
        }

        let fragments: string[] = [this.message.substring(0, idx)];
        let temp: string        = this.message.substring(idx);

        while (true) {

            idx = temp.indexOf("\"", 1);
            if (idx != -1) {

                if (temp.startsWith("\"")) {
                    fragments.push(temp.substring(0, idx + 1));
                    temp = temp.substring(idx + 1);
                } else {
                    fragments.push(temp.substring(0, idx));
                    temp = temp.substring(idx);
                }

            } else {
                break;
            }

        }

        if (temp.length > 0) {
            fragments.push(temp);
        }

        return fragments;

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

        let payload: ISwtorMessage[] = messages.payload;
      
        payload.map((message) => new SwtorMessage(message)).forEach((message) => {
            add_swtor_channel_message(message);
            add_player(message.from);
        });            

    });

}