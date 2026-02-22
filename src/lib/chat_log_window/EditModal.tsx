import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

    return (
        <motion.div
            className="w-72 min-h-48 bg-slate-700 p-2 border-2 border-slate-800 fixed z-20 flex flex-col gap-1"
            style={{ top: "calc(50% - 12rem)", left: "calc(50% - 9rem)" }}
            initial={{ y: -1000 }}
            animate={{ y: 0 }}
            exit={{ y: -1000 }}
            transition={{ duration: 0.5 }}
        >
            <input
                type="text"
                value={chat_tab.name}
                onChange={(e) => setChatTab((t) => ({ ...t, name: e.target.value }))}
                maxLength={12}
                className="outline-none border-2 border-slate-800 text-xl"
                placeholder="tab name"
            />
            <p className="text-white text-xl"><b>Channel subscriptions</b></p>
            <ChannelList
                channels={chat_tab.channels}
                show_custom_channels={true}
                onChannelInput={(channels) => setChatTab((t) => ({ ...t, channels }))}
            />
            <div className="flex flex-row gap-1">
                <button
                    type="button"
                    className="text-white border-slate-800 border-2 rounded-md w-1/2 text-xl"
                    onClick={on_save}
                >
                    Save
                </button>
                <button
                    type="button"
                    className="text-white border-slate-800 border-2 rounded-md w-1/2 text-xl"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}
