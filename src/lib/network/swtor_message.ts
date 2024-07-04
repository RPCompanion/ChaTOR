
import { get } from "svelte/store";
import { settings } from "./settings";
import { listen } from "@tauri-apps/api/event";
import { SwtorChannel, ESwtorChannel } from "./swtor_channel";
import { add_swtor_channel_message } from "./swtor_message/swtor_chat_tab_messages";
import { active_character } from "./characters";
import { add_player } from "./players";
import { 
    parse_hyperlink, 
    HYPERLINK_RE, 
    type HyperlinkType 
} from "../hyperlink_parser";

export class SwtorMessage {

    public readonly channel: SwtorChannel;
    public readonly timestamp: string;
    public readonly from: string;
    public readonly to: string;
    public readonly message: string;
    public readonly message_fragments: (string | HyperlinkType)[] = [];
    public read: boolean = false;
    
    constructor(swtor_message: ISwtorMessage) {

        this.channel   = new SwtorChannel(swtor_message.channel);
        this.timestamp = new Date(swtor_message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit"});
        this.from      = swtor_message.from;
        this.to        = swtor_message.to;
        this.message   = SwtorMessage.replace_html_entities(swtor_message.message);
        this.message_fragments = this.get_message_fragments_v2();

    }

    private static replace_html_entities(message: string): string {

        return message
            .replaceAll("&quot;", "\"")
            .replaceAll("&gt;", ">")
            .replaceAll("&lt;", "<")
            .replaceAll("&amp;", "&")
            .replaceAll("&apos;", "'");

    }

    private get_message_fragments_v2(): (string | HyperlinkType)[] {

        if (!get(settings).chat_log.window.show_unknown_ids) {
            return this.get_fragments_with_unknown();
        }

        return this.get_fragments_with_hyperlinks();

    }
    
    private get_fragments_with_unknown(): (string | HyperlinkType)[] {

        let temp = this.message.slice(0);
        for (let obj of temp.matchAll(HYPERLINK_RE)) {
            temp = temp.replace(obj[0], "<Unknown>");
        }

        return [temp];

    }

    private get_fragments_with_hyperlinks(): (string | HyperlinkType)[] {

        let start_idx: number = 0;
        let fragments: (string | HyperlinkType)[] = [];
        for (let obj of this.message.matchAll(HYPERLINK_RE)) {
            
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

    /**
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

export function init_swtor_message_listener() {

    listen("swtor_messages", (messages: any) => {

        let payload: ISwtorMessage[] = messages.payload;
      
        payload.map((message) => new SwtorMessage(message)).forEach((message) => {
            add_swtor_channel_message(message);
            add_player(message.from);
        });            

    });

}