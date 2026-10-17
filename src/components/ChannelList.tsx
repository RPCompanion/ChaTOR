import React from "react";
import { useChannelStore } from "../store/useChannelStore";
import type { ChannelDispatcher } from "../lib/network/settings";
import { ESwtorChannel } from "../lib/network/swtor_channel";

interface ChannelListProps {
    channels: ChannelDispatcher[];
    show_custom_channels?: boolean;
    onChannelInput: (channels: ChannelDispatcher[]) => void;
}

export default function ChannelList({ channels, show_custom_channels = false, onChannelInput }: ChannelListProps) {
    const custom_channels = useChannelStore((s) => s.customChannels);
    const channel_strings = Object.keys(ESwtorChannel).filter((key) => isNaN(Number(key)));

    const select_channel_numbers = channels
        .filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c)
        .map((c) => c.RegularDispatch);

    const selected_custom_channels = channels
        .filter((c): c is { CustomDispatch: string } => "CustomDispatch" in c)
        .map((c) => c.CustomDispatch);

    function on_channel_input(channel: string) {
        const channel_number = Number(ESwtorChannel[channel as keyof typeof ESwtorChannel]);
        const index = channels.findIndex((c) => "RegularDispatch" in c && c.RegularDispatch === channel_number);
        let updated: ChannelDispatcher[];
        if (index === -1) {
            updated = [...channels, { RegularDispatch: channel_number }];
        } else {
            updated = channels.filter((_, i) => i !== index);
        }
        onChannelInput(updated);
    }

    function on_custom_channel_input(channel: string) {
        const index = channels.findIndex((c) => "CustomDispatch" in c && c.CustomDispatch === channel);
        let updated: ChannelDispatcher[];
        if (index === -1) {
            updated = [...channels, { CustomDispatch: channel }];
        } else {
            updated = channels.filter((_, i) => i !== index);
        }
        onChannelInput(updated);
    }

    function swtor_channel_is_checked(channel: string): boolean {
        return select_channel_numbers.includes(Number(ESwtorChannel[channel as keyof typeof ESwtorChannel]));
    }

    return (
        <>
            {channel_strings.map((channel) => (
                <div key={channel} className="flex flex-row gap-1">
                    <input
                        type="checkbox"
                        id={channel}
                        name={channel}
                        checked={swtor_channel_is_checked(channel)}
                        onChange={() => on_channel_input(channel)}
                        className="text-lg"
                    />
                    <label htmlFor={channel} className="text-ink-100 text-lg">{channel}</label>
                </div>
            ))}
            {show_custom_channels && (
                <>
                    <div className="border-2"></div>
                    <p className="text-ink-100 text-lg"><b>Custom Channels</b></p>
                    {custom_channels.map((channel) => (
                        <div key={channel.channel_name} className="flex flex-row gap-1">
                            <input
                                type="checkbox"
                                id={channel.channel_name}
                                name={channel.channel_name}
                                checked={selected_custom_channels.includes(channel.channel_name)}
                                onChange={() => on_custom_channel_input(channel.channel_name)}
                                className="text-lg"
                            />
                            <label htmlFor={channel.channel_name} className="text-ink-100 text-lg">{channel.channel_name}</label>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}
