import React, { useState } from "react";
import { motion } from "framer-motion";
import XButton from "../buttons/XButton";
import { toast } from "react-toastify";
import { Result, Ok, Err } from "../result";
import type { IChatTab } from "../network/settings";
import { useAppStore } from "../../store/useAppStore";
import { rename_swtor_channel } from "../network/swtor_message/swtor_chat_tab_messages";
import ChannelList from "../../components/ChannelList";
import { deep_copy } from "../utils";

interface EditModalProps {
    index?: number;
    chat_tab?: IChatTab;
    onSave: (chat_tab: IChatTab) => void;
    onCancel: () => void;
}

const CHAT_TAB_MAX_LENGTH = 16;

export default function EditModal({ index, chat_tab: initial_tab, onSave, onCancel }: EditModalProps) {
    const settings = useAppStore((s) => s.settings);
    const [chat_tab, setChatTab] = useState<IChatTab>(
        initial_tab ? deep_copy(initial_tab) : { name: "", channels: [], default_channel: null }
    );

    function validate_chat_tab_name(): Result<[], string> {
        if (chat_tab.name.length === 0) return Err("Chat tab name cannot be empty");
        if (chat_tab.name.length > CHAT_TAB_MAX_LENGTH)
            return Err(`Chat tab name cannot be longer than ${CHAT_TAB_MAX_LENGTH} characters`);

        const filter_results = settings.chat_log.window.chat_tabs.filter((tab) => tab.name === chat_tab.name);
        if (index == undefined || settings.chat_log.window.chat_tabs[index]?.name !== chat_tab.name) {
            if (filter_results.length > 0) return Err("Chat tab name must be unique");
        }
        return Ok([]);
    }

    function validate_channels(): Result<[], string> {
        if (chat_tab.channels.length === 0) return Err("Chat tab must have at least one channel");
        return Ok([]);
    }

    function rename_swtor_channel_messages(new_name: string) {
        if (index == undefined) return;
        const old_name = settings.chat_log.window.chat_tabs[index].name;
        rename_swtor_channel(old_name, new_name);
    }

    function on_save() {
        const trimmed = { ...chat_tab, name: chat_tab.name.trim() };
        setChatTab(trimmed);

        const name_result = validate_chat_tab_name();
        if (name_result.is_err()) {
            toast.error(name_result.unwrap_err());
            return;
        }
        const c_result = validate_channels();
        if (c_result.is_err()) {
            toast.error(c_result.unwrap_err());
            return;
        }
        rename_swtor_channel_messages(trimmed.name);
        onSave(trimmed);
    }

    const selected_count = chat_tab.channels.length;

    return (
        <motion.div
            className="fixed inset-0 z-20 grid place-items-center bg-space-950/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <motion.div
                className="panel panel-glass w-[26rem] max-w-[92vw] max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950 p-4 flex flex-col gap-4"
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.18 }}
            >
                <div className="flex items-center justify-between">
                    <h1 className="eyebrow">{index == undefined ? "New chat tab" : "Edit chat tab"}</h1>
                    <XButton onClick={onCancel} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-ink-300" htmlFor="chat-tab-name">Tab name</label>
                    <div className="relative">
                        <input
                            id="chat-tab-name"
                            type="text"
                            value={chat_tab.name}
                            onChange={(e) => setChatTab((t) => ({ ...t, name: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") on_save(); if (e.key === "Escape") onCancel(); }}
                            maxLength={CHAT_TAB_MAX_LENGTH}
                            className="input pr-12"
                            placeholder="e.g. Guild"
                            autoFocus
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-500 tabular-nums">
                            {chat_tab.name.length}/{CHAT_TAB_MAX_LENGTH}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                        <span className="text-xs text-ink-300">Channels shown in this tab</span>
                        <span className="text-[10px] text-ink-500 tabular-nums">{selected_count} selected</span>
                    </div>
                    <div className="holo-line mb-2"></div>
                    <ChannelList
                        channels={chat_tab.channels}
                        show_custom_channels={true}
                        onChannelInput={(channels) => setChatTab((t) => ({ ...t, channels }))}
                    />
                </div>

                <div className="flex flex-row gap-2 pt-1">
                    <button type="button" className="btn btn-primary w-1/2" onClick={on_save}>Save</button>
                    <button type="button" className="btn w-1/2" onClick={onCancel}>Cancel</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
