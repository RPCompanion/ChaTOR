import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../../store/useAppStore";
import { useChatLogStore } from "../../../store/useChatLogStore";
import { SwtorMessage, type ISwtorMessage } from "../swtor_message";
import { Result, Ok, Err } from "../../result";
import { add_player } from "../players";
import type { IChatLogMessage } from "../chat_log_message";
import { ESwtorChannel } from "../swtor_channel";

export class SwtorChatTabMessages {
    public chat_tab_name: string;
    public messages: SwtorMessage[] = [];

    constructor(chat_tab_name: string) {
        this.chat_tab_name = chat_tab_name;
    }
}

export function set_initial_swtor_channels() {
    const settings = useAppStore.getState().settings;
    const t_scm: SwtorChatTabMessages[] = settings.chat_log.window.chat_tabs.map(
        (chat_tab) => new SwtorChatTabMessages(chat_tab.name)
    );
    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
}

export function remove_swtor_channel(chat_tab_name: string): Result<[], string> {
    const t_scm = [...useChatLogStore.getState().swtorChannelMessages];
    const t_index = t_scm.findIndex((c) => c.chat_tab_name === chat_tab_name);
    if (t_index === -1) {
        return Err("Chat tab not found");
    }
    t_scm.splice(t_index, 1);
    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
    return Ok([]);
}

export function add_swtor_channel(chat_tab_name: string): Result<[], string> {
    const t_scm = [...useChatLogStore.getState().swtorChannelMessages];
    const t_index = t_scm.findIndex((c) => c.chat_tab_name === chat_tab_name);
    if (t_index !== -1) {
        return Err("Chat tab already exists");
    }
    t_scm.push(new SwtorChatTabMessages(chat_tab_name));
    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
    return Ok([]);
}

export function rename_swtor_channel(old_name: string, new_name: string): Result<[], string> {
    const t_scm = [...useChatLogStore.getState().swtorChannelMessages];
    const t_index = t_scm.findIndex((c) => c.chat_tab_name === old_name);
    if (t_index === -1) {
        return Err("Chat tab not found");
    }
    t_scm[t_index] = { ...t_scm[t_index], chat_tab_name: new_name };
    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
    return Ok([]);
}

export function add_swtor_channel_message(message: SwtorMessage) {
    const t_scm = useChatLogStore.getState().swtorChannelMessages.map((tab) => ({
        ...tab,
        messages: [...tab.messages]
    }));
    const settings = useAppStore.getState().settings;

    const relevant_chat_tabs: string[] = settings.chat_log.window.chat_tabs
        .filter((chat_tab) => {
            if (message.channel.type === ESwtorChannel.CUSTOM_CHANNEL) {
                return chat_tab.channels
                    .filter((c): c is { CustomDispatch: string } => "CustomDispatch" in c)
                    .map((c) => c.CustomDispatch.toLocaleLowerCase())
                    .includes(message.to.replace("Usr.", ""));
            } else {
                return chat_tab.channels
                    .filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c)
                    .map((c) => c.RegularDispatch)
                    .includes(message.channel.type);
            }
        })
        .map((chat_tab) => chat_tab.name);

    t_scm.forEach((chat_tab_messages) => {
        if (relevant_chat_tabs.includes(chat_tab_messages.chat_tab_name)) {
            chat_tab_messages.messages.push(message);
        }
    });

    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
}

export function set_swtor_channel_messages_to_read(chat_tab_name: string) {
    const current = useChatLogStore.getState().swtorChannelMessages;
    const tab = current.find((t) => t.chat_tab_name === chat_tab_name);
    if (!tab || tab.messages.every((m) => m.read)) return;

    tab.messages.forEach((m) => { m.read = true; });
    useChatLogStore.getState().setSwtorChannelMessages([...current]);
}

export function clear_swtor_channel_messages(chat_tab_name: string) {
    const t_scm = useChatLogStore.getState().swtorChannelMessages.map((tab) => {
        if (tab.chat_tab_name === chat_tab_name) {
            return { ...tab, messages: [] };
        }
        return tab;
    });
    useChatLogStore.getState().setSwtorChannelMessages(t_scm);
}

export function restore_todays_messages() {
    invoke("get_todays_chat_log").then((response) => {
        const messages = (response as IChatLogMessage[]).map((m) => m.message);

        // Clear all tabs
        const cleared = useChatLogStore.getState().swtorChannelMessages.map((tab) => ({
            ...tab,
            messages: [] as SwtorMessage[]
        }));
        useChatLogStore.getState().setSwtorChannelMessages(cleared);

        messages.map((message) => new SwtorMessage(message)).forEach((message) => {
            add_swtor_channel_message(message);
            add_player(message.from);
        });
    });
}
