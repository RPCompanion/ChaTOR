import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import XButton from "../lib/buttons/XButton";
import Color from "./channel_color_picker_modal/Color";
import type { IColor } from "../lib/network/local_characters";

interface ChannelColorPickerModalProps {
    show: boolean;
    onClose: () => void;
}

export default function ChannelColorPickerModal({ show, onClose }: ChannelColorPickerModalProps) {
    const updateSettings = useAppStore((s) => s.updateSettings);
    const channel_colors = useAppStore((s) => s.settings.chat_log.window.channel_colors);

    function make_handler(key: keyof typeof channel_colors) {
        return (color: IColor) => updateSettings((draft) => {
            draft.chat_log.window.channel_colors[key] = color;
        });
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed p-3 w-60 panel panel-glass z-10"
                    style={{ left: "calc(50% - 6.5rem)" }}
                    initial={{ y: -500 }}
                    animate={{ y: 0 }}
                    exit={{ y: -500 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-row gap-1">
                        <h1 className="eyebrow">Channel Colors</h1>
                        <div className="relative left-8">
                            <XButton onClick={onClose} />
                        </div>
                    </div>
                    <Color text="Global"     color={channel_colors.global}     onColorChange={make_handler("global")} />
                    <Color text="PVP"        color={channel_colors.pvp}        onColorChange={make_handler("pvp")} />
                    <Color text="Trade"      color={channel_colors.trade}      onColorChange={make_handler("trade")} />
                    <div className="holo-line my-2"></div>
                    <Color text="Say"        color={channel_colors.say}        onColorChange={make_handler("say")} />
                    <Color text="Yell"       color={channel_colors.yell}       onColorChange={make_handler("yell")} />
                    <Color text="Emote"      color={channel_colors.emote}      onColorChange={make_handler("emote")} />
                    <Color text="Whisper"    color={channel_colors.whisper}    onColorChange={make_handler("whisper")} />
                    <Color text="Group"      color={channel_colors.group}      onColorChange={make_handler("group")} />
                    <Color text="Guild"      color={channel_colors.guild}      onColorChange={make_handler("guild")} />
                    <Color text="Ops"        color={channel_colors.ops}        onColorChange={make_handler("ops")} />
                    <Color text="Ops Leader" color={channel_colors.ops_leader} onColorChange={make_handler("ops_leader")} />
                    <div className="h-6"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
