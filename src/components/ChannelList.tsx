import React from "react";
import { useChannelStore } from "../store/useChannelStore";
import type { ChannelDispatcher } from "../lib/network/settings";
import { ESwtorChannel } from "../lib/network/swtor_channel";

interface ChannelListProps {
    channels: ChannelDispatcher[];
    show_custom_channels?: boolean;
    /// Compact single group instead of labelled sections (used by the log filter).
    compact?: boolean;
    onChannelInput: (channels: ChannelDispatcher[]) => void;
}

interface ChannelGroup {
    title: string;
    channels: { id: ESwtorChannel; label: string }[];
}

/// Human labels, grouped the way the game's chat settings present them.
/// CUSTOM_CHANNEL is an internal marker and is never listed.
export const CHANNEL_GROUPS: ChannelGroup[] = [
    {
        title: "Local",
        channels: [
            { id: ESwtorChannel.SAY, label: "Say" },
            { id: ESwtorChannel.YELL, label: "Yell" },
            { id: ESwtorChannel.EMOTE, label: "Emote" },
            { id: ESwtorChannel.WHISPER, label: "Whisper" },
        ],
    },
    {
        title: "Global",
        channels: [
            { id: ESwtorChannel.GLOBAL, label: "Global" },
            { id: ESwtorChannel.PVP, label: "PvP" },
            { id: ESwtorChannel.TRADE, label: "Trade" },
        ],
    },
    {
        title: "Group & Guild",
        channels: [
            { id: ESwtorChannel.GROUP, label: "Group" },
            { id: ESwtorChannel.OP, label: "Ops" },
            { id: ESwtorChannel.OPS_OFFICER, label: "Ops Officer" },
            { id: ESwtorChannel.OPS_ANNOUNCEMENT, label: "Ops Announcement" },
            { id: ESwtorChannel.GUILD, label: "Guild" },
            { id: ESwtorChannel.GUILD_OFFICER, label: "Guild Officer" },
        ],
    },
];

interface ChipProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
}

function Chip({ label, selected, onToggle }: ChipProps) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={onToggle}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-xs select-none transition-colors
                ${selected
                    ? "border-holo-500/70 bg-holo-500/15 text-holo-300 shadow-[0_0_10px_rgb(var(--holo-rgb)/0.2)]"
                    : "border-holo-500/20 bg-space-800/50 text-ink-300 hover:text-ink-100 hover:border-holo-500/50"}`}
        >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${selected ? "bg-holo-500" : "bg-ink-500"}`}></span>
            {label}
        </button>
    );
}

export default function ChannelList({ channels, show_custom_channels = false, compact = false, onChannelInput }: ChannelListProps) {
    const custom_channels = useChannelStore((s) => s.customChannels);

    const regular_selected = new Set(
        channels.filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c).map((c) => c.RegularDispatch)
    );
    const custom_selected = new Set(
        channels.filter((c): c is { CustomDispatch: string } => "CustomDispatch" in c).map((c) => c.CustomDispatch)
    );

    function toggle_regular(id: number) {
        const exists = channels.some((c) => "RegularDispatch" in c && c.RegularDispatch === id);
        onChannelInput(exists
            ? channels.filter((c) => !("RegularDispatch" in c && c.RegularDispatch === id))
            : [...channels, { RegularDispatch: id }]);
    }

    function toggle_custom(name: string) {
        const exists = channels.some((c) => "CustomDispatch" in c && c.CustomDispatch === name);
        onChannelInput(exists
            ? channels.filter((c) => !("CustomDispatch" in c && c.CustomDispatch === name))
            : [...channels, { CustomDispatch: name }]);
    }

    return (
        <div className="flex flex-col gap-3">
            {CHANNEL_GROUPS.map((group) => (
                <div key={group.title}>
                    {!compact && <div className="eyebrow text-[10px] mb-1.5">{group.title}</div>}
                    <div className="flex flex-wrap gap-1.5">
                        {group.channels.map((ch) => (
                            <Chip
                                key={ch.id}
                                label={ch.label}
                                selected={regular_selected.has(ch.id)}
                                onToggle={() => toggle_regular(ch.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
            {show_custom_channels && (
                <div>
                    <div className="eyebrow text-[10px] mb-1.5">Custom channels</div>
                    {custom_channels.length === 0 ? (
                        <div className="text-xs text-ink-500">
                            None yet. Add them under Chat → Add/Edit Custom Channels.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {custom_channels.map((channel) => (
                                <Chip
                                    key={channel.channel_name}
                                    label={channel.channel_name}
                                    selected={custom_selected.has(channel.channel_name)}
                                    onToggle={() => toggle_custom(channel.channel_name)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
