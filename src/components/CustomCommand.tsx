import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { useChatLogStore } from "../store/useChatLogStore";
import { useChannelStore } from "../store/useChannelStore";
import { ESwtorChannel } from "../lib/network/swtor_channel";
import Tooltip from "./Tooltip";

export default function CustomCommand() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const active_chat_tab_index = useChatLogStore((s) => s.activeChatTabIndex);
    const custom_channels = useChannelStore((s) => s.customChannels);

    const channels = Object.keys(ESwtorChannel)
        .filter((key) => isNaN(Number(key)))
        .filter((key) => key !== "WHISPER" && key !== "CUSTOM_CHANNEL");

    function get_channel_number(channel: string): number {
        return ESwtorChannel[channel as keyof typeof ESwtorChannel];
    }

    const default_channel = settings.chat_log.window.chat_tabs[active_chat_tab_index]?.default_channel;

    let current_value: number | string | undefined;
    if (default_channel == null || default_channel == undefined) {
        current_value = undefined;
    } else if ("RegularDispatch" in default_channel) {
        current_value = default_channel.RegularDispatch;
    } else {
        current_value = default_channel.CustomDispatch;
    }

    function on_change(e: React.ChangeEvent<HTMLSelectElement>) {
        const raw = e.target.value;
        if (raw === "none") {
            updateSettings((draft) => {
                draft.chat_log.window.chat_tabs[active_chat_tab_index].default_channel = null;
            });
            return;
        }
        const num = Number(raw);
        if (!isNaN(num)) {
            updateSettings((draft) => {
                draft.chat_log.window.chat_tabs[active_chat_tab_index].default_channel = { RegularDispatch: num };
            });
        } else {
            updateSettings((draft) => {
                draft.chat_log.window.chat_tabs[active_chat_tab_index].default_channel = { CustomDispatch: raw };
            });
        }
    }

    const select_value = current_value === undefined ? "none" : String(current_value);

    return (
        <div className="flex flex-row gap-1">
            <Tooltip tooltip_text="Set the default channel for current chat tab" placement="right">
                <select
                    value={select_value}
                    onChange={on_change}
                    className="rounded-md outline-none border-none bg-slate-600 text-white px-1 select-none cursor-pointer"
                >
                    <option value="none">none</option>
                    {channels.map((channel) => (
                        <option key={channel} value={String(get_channel_number(channel))}>
                            {channel.toLowerCase().replace("_", " ")}
                        </option>
                    ))}
                    <hr />
                    {custom_channels.map((channel) => (
                        <option key={channel.channel_name} value={channel.channel_name}>
                            {channel.channel_name.toLowerCase()}
                        </option>
                    ))}
                </select>
            </Tooltip>
        </div>
    );
}
