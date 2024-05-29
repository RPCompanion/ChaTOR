
import { settings } from "../settings";
import { SwtorMessage } from "../swtor_message";
import { writable, get } from "svelte/store";
import { Result, Ok, Err } from "../../result";

export class SwtorChatTabMessages {
    
    public chat_tab_name: string;
    public messages: SwtorMessage[] = [];

    constructor(chat_tab_name: string) {
        this.chat_tab_name = chat_tab_name;
    }
    
}

export const swtor_channel_messages = writable<SwtorChatTabMessages[]>([]);

export function set_initial_swtor_channels() {

    let t_settings = get(settings);
    let t_scm: SwtorChatTabMessages[] = [];

    t_settings.chat_log.window.chat_tabs.forEach((chat_tab) => {
        t_scm.push(new SwtorChatTabMessages(chat_tab.name));
    });

    swtor_channel_messages.set(t_scm);

}

export function remove_swtor_channel(chat_tab_name: string): Result<[], string> {

    let t_scm = get(swtor_channel_messages);
    let t_index = t_scm.findIndex((chat_tab_messages) => chat_tab_messages.chat_tab_name == chat_tab_name);

    if (t_index == -1) {
        return Err("Chat tab not found");
    }

    t_scm.splice(t_index, 1);
    swtor_channel_messages.set(t_scm);
    return Ok([]);

}

export function add_swtor_channel(chat_tab_name: string): Result<[], string> {

    let t_scm = get(swtor_channel_messages);
    let t_index = t_scm.findIndex((chat_tab_messages) => chat_tab_messages.chat_tab_name == chat_tab_name);

    if (t_index != -1) {
        return Err("Chat tab already exists");
    }

    t_scm.push(new SwtorChatTabMessages(chat_tab_name));
    swtor_channel_messages.set(t_scm);
    return Ok([]);

}

export function rename_swtor_channel(old_name: string, new_name: string): Result<[], string> {
    
    let t_scm = get(swtor_channel_messages);
    let t_index = t_scm.findIndex((chat_tab_messages) => chat_tab_messages.chat_tab_name == old_name);

    if (t_index == -1) {
        return Err("Chat tab not found");
    }

    t_scm[t_index].chat_tab_name = new_name;
    swtor_channel_messages.set(t_scm);
    return Ok([]);

}

export function add_swtor_channel_message(message: SwtorMessage) {

    let t_scm = get(swtor_channel_messages);
    let t_settings = get(settings);

    let relevant_chat_tabs: string[] = t_settings.chat_log.window.chat_tabs
        .filter((chat_tab) => chat_tab.channels.includes(message.channel.type))
        .map((chat_tab) => chat_tab.name);
    
    t_scm.forEach((chat_tab_messages) => {

        if (relevant_chat_tabs.includes(chat_tab_messages.chat_tab_name)) { 
            chat_tab_messages.messages.push(message);
        }

    });

    swtor_channel_messages.set(t_scm);

}

export function set_swtor_channel_messages_to_read(chat_tab_name: string) {

    let t_scm = get(swtor_channel_messages);
    let t_chat_tab = t_scm.find((chat_tab) => chat_tab.chat_tab_name == chat_tab_name);

    if (t_chat_tab == undefined) {
        return;
    }

    t_chat_tab.messages.forEach((message) => {
        message.read = true;
    });
    swtor_channel_messages.set(t_scm);

}
