
import { get } from "svelte/store";
import { swtor_channel_messages } from "../network/swtor_message";

export function set_swtor_channel_messages_read(chat_tab_name: string) {

    let t_swtor_channel_messages = get(swtor_channel_messages);
    let chat_tab = t_swtor_channel_messages.find((chat_tab) => chat_tab.chat_tab_name === chat_tab_name);

    if (chat_tab == undefined) {
        return;
    }

    chat_tab.messages.forEach((message) => {
        message.read = true;
    });

    swtor_channel_messages.set(t_swtor_channel_messages);

}