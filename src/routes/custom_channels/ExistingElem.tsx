import React, { useState } from "react";
import { useChannelStore } from "../../store/useChannelStore";
import {
    custom_channel_delete,
    custom_channel_save,
    type ICustomChannel,
} from "../../lib/network/custom_channels";
import XButton from "../../lib/buttons/XButton";
import { deep_copy, toast_error } from "../../lib/utils";
import { channel_name_valid } from "./custom_channels";

interface ExistingElemProps {
    channel: ICustomChannel;
}

export default function ExistingElem({ channel: initial_channel }: ExistingElemProps) {
    const custom_channels = useChannelStore((s) => s.customChannels);
    const [channel, setChannel] = useState(initial_channel);
    const channel_cache = deep_copy(initial_channel);

    function get_available_channels(existing_number: number): number[] {
        const temp = [4, 5, 6, 7, 8, 9, 0].filter(
            (n) => !custom_channels.find((c) => c.channel_number === n)
        );
        if (!temp.includes(existing_number)) temp.push(existing_number);
        temp.sort((a, b) => a - b);
        return temp;
    }

    async function on_delete() {
        const result = await custom_channel_delete(channel);
        if (result.is_err()) toast_error(result.unwrap_err());
    }

    async function on_change() {
        const valid = channel_name_valid(channel.channel_name);
        if (valid.is_err()) {
            toast_error(valid.unwrap_err());
            setChannel((c) => ({ ...c, channel_name: channel_cache.channel_name }));
            return;
        }
        const result = await custom_channel_save(channel);
        if (result.is_err()) toast_error(result.unwrap_err());
    }

    return (
        <div className="flex flex-row gap-2 w-full justify-center px-10 select-none">
            <input
                type="text"
                value={channel.channel_name}
                onChange={(e) => setChannel((c) => ({ ...c, channel_name: e.target.value }))}
                onBlur={on_change}
                className="input w-auto py-1"
            />
            <div className="flex flex-row gap-2">
                <div className="text-ink-100 text-lg">Channel Number</div>
                <select
                    value={channel.channel_number}
                    onChange={(e) => {
                        const updated = { ...channel, channel_number: Number(e.target.value) };
                        setChannel(updated);
                        custom_channel_save(updated);
                    }}
                    className="input w-auto py-1"
                >
                    {get_available_channels(channel.channel_number).map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <XButton onClick={on_delete} />
            </div>
        </div>
    );
}
