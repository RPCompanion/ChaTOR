import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import XButton from "../lib/buttons/XButton";
import Color from "./channel_color_picker_modal/Color";
import type { IColor } from "../lib/network/local_characters";
import type { IChannelColors } from "../lib/network/settings";

interface ChannelColorPickerModalProps {
    show: boolean;
    onClose: () => void;
}

type ChannelKey = keyof IChannelColors;

const GLOBAL_CHANNELS: { key: ChannelKey; label: string }[] = [
    { key: "global", label: "Global" },
    { key: "pvp", label: "PVP" },
    { key: "trade", label: "Trade" },
];

const LOCAL_CHANNELS: { key: ChannelKey; label: string }[] = [
    { key: "say", label: "Say" },
    { key: "yell", label: "Yell" },
    { key: "emote", label: "Emote" },
    { key: "whisper", label: "Whisper" },
    { key: "group", label: "Group" },
    { key: "guild", label: "Guild" },
    { key: "ops", label: "Ops" },
    { key: "ops_leader", label: "Ops Leader" },
];

export default function ChannelColorPickerModal({ show, onClose }: ChannelColorPickerModalProps) {
    const updateSettings = useAppStore((s) => s.updateSettings);
    const channel_colors = useAppStore((s) => s.settings.chat_log.window.channel_colors);
    const [open_key, setOpenKey] = useState<ChannelKey | null>(null);

    function make_handler(key: ChannelKey) {
        return (color: IColor) => updateSettings((draft) => {
            draft.chat_log.window.channel_colors[key] = color;
        });
    }

    function row(ch: { key: ChannelKey; label: string }) {
        return (
            <Color
                key={ch.key}
                text={ch.label}
                color={channel_colors[ch.key]}
                open={open_key === ch.key}
                onToggle={() => setOpenKey((k) => (k === ch.key ? null : ch.key))}
                onColorChange={make_handler(ch.key)}
            />
        );
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed w-72 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950 p-3 panel panel-glass z-10"
                    style={{ left: "calc(50% - 9rem)", top: "5rem" }}
                    initial={{ y: -24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -24, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="eyebrow">Channel Colors</h1>
                        <XButton onClick={onClose} />
                    </div>
                    <div className="text-[11px] text-ink-300 mb-2">Click a channel to pick its colour.</div>
                    {GLOBAL_CHANNELS.map(row)}
                    <div className="holo-line my-2"></div>
                    {LOCAL_CHANNELS.map(row)}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
