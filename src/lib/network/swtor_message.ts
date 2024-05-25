
import { get, writable } from "svelte/store";
import { settings } from "./settings";
import { listen } from "@tauri-apps/api/event";
import { Channel } from "./swtor_channel";

export class SwtorChatTabMessages {
    
    public chat_tab_name: string;
    public messages: SwtorMessage[] = [];

    constructor(chat_tab_name: string) {
        this.chat_tab_name = chat_tab_name;
    }
    
}

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
export const swtor_channel_messages = writable<SwtorChatTabMessages[]>([]);

function setup_setting_subscription() {

    settings.subscribe((settings) => {

        let t_swtor_channel_messages = get(swtor_channel_messages);

        if (t_swtor_channel_messages.length <= settings.chat.chat_tabs.length) {

            let temp = t_swtor_channel_messages.map((chat_tab) => chat_tab.chat_tab_name);
            settings.chat.chat_tabs.forEach((chat_tab) => {
                
                if (!temp.includes(chat_tab.name)) {
                    t_swtor_channel_messages.push(new SwtorChatTabMessages(chat_tab.name));
                }

            });

        } else {

            t_swtor_channel_messages = t_swtor_channel_messages.filter((chat_tab) => {
                return settings.chat.chat_tabs.map((chat_tab) => chat_tab.name).includes(chat_tab.chat_tab_name);
            });

        }

        swtor_channel_messages.set(t_swtor_channel_messages);

    });

}

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

    const re: RegExp = /<HL LID="([^"]+)">/g;
    payload.forEach((message) => {

        for (let obj of message.message.matchAll(re)) {
            message.message = message.message.replace(obj[0], "");
        }

    });

}

export function init_swtor_message_listener() {

    setup_setting_subscription();
    listen("swtor_messages", (messages: any) => {

        let t_chat_tab_messages = get(swtor_channel_messages);
        let payload: ISwtorMessage[] = messages.payload;

        replace_html_entities(payload);
        replace_html_tags(payload);

        let t_settings = get(settings);        
        payload.map((message) => new SwtorMessage(message)).forEach((message) => {

           t_settings.chat.chat_tabs.forEach((chat_tab) => {

                if (!chat_tab.channels.includes(message.channel.type)) {
                    return;
                }

                let t_find = t_chat_tab_messages.find((chat_tab_messages) => chat_tab_messages.chat_tab_name == chat_tab.name)
                if (t_find == undefined) {
                    return;
                }

                t_find.messages.push(message);

           }); 

        });

        swtor_channel_messages.set(t_chat_tab_messages);

    });

}