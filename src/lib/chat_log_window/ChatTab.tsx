import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowsOutCardinal } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "../../store/useAppStore";
import { useChatLogStore } from "../../store/useChatLogStore";
import {
    remove_swtor_channel,
    clear_swtor_channel_messages,
    set_swtor_channel_messages_to_read,
    is_dice_roll,
} from "../network/swtor_message/swtor_chat_tab_messages";
import EditModal from "./EditModal";
import type { IChatTab } from "../network/settings";
import { useClickOutside } from "../useClickOutside";
import { deep_copy } from "../utils";

interface ChatTabProps {
    chat_tab: IChatTab;
    index: number;
}

export default function ChatTab({ chat_tab, index }: ChatTabProps) {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const active_chat_tab_index = useChatLogStore((s) => s.activeChatTabIndex);
    const setActiveChatTabIndex = useChatLogStore((s) => s.setActiveChatTabIndex);
    const swtor_channel_messages = useChatLogStore((s) => s.swtorChannelMessages);

    const [show_edit_tab, setShowEditTab] = useState(false);
    const [show_edit_modal, setShowEditModal] = useState(false);
    const [mouse_over, setMouseOver] = useState(false);

    const tabRef = useRef<HTMLDivElement>(null);
    useClickOutside(tabRef, () => setShowEditTab(false));

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chat_tab.name });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined };

    const unread_message_count =
        swtor_channel_messages.find((c) => c.chat_tab_name === chat_tab.name)?.messages.filter((m) => !is_dice_roll(m) && !m.read).length ?? 0;

    function on_click() {
        if (active_chat_tab_index === index) {
            setShowEditTab((v) => !v);
            return;
        }
        setActiveChatTabIndex(index);
        set_swtor_channel_messages_to_read(settings.chat_log.window.chat_tabs[index].name);
    }

    function on_delete() {
        setShowEditTab(false);
        updateSettings((draft) => {
            draft.chat_log.window.chat_tabs.splice(index, 1);
        });
        remove_swtor_channel(chat_tab.name);
        if (active_chat_tab_index !== 0) {
            setActiveChatTabIndex(active_chat_tab_index - 1);
        }
    }

    function on_clear_chat() {
        clear_swtor_channel_messages(chat_tab.name);
        setShowEditTab(false);
    }

    function on_modal_save(updated: IChatTab) {
        updateSettings((draft) => {
            draft.chat_log.window.chat_tabs[index] = updated;
        });
        setShowEditModal(false);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative"
            onMouseEnter={() => setMouseOver(true)}
            onMouseLeave={() => setMouseOver(false)}
        >
            <div ref={tabRef} className="relative">
                {unread_message_count > 0 && (
                    <div className="absolute -right-1 -top-2 bg-ember-500 text-white font-semibold px-1.5 rounded-full shadow-[0_0_8px_rgb(242_146_51/0.6)] text-[10px] leading-4">
                        {unread_message_count > 9 ? "9+" : unread_message_count}
                    </div>
                )}
                <AnimatePresence>
                    {mouse_over && (
                        <motion.div
                            {...attributes}
                            {...listeners}
                            className="w-4 h-4 -top-1 -left-1 absolute cursor-grab"
                            aria-label={`drag-handle for ${chat_tab.name}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ArrowsOutCardinal className="text-ink-100" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    type="button"
                    className={`chat-tab ${active_chat_tab_index === index ? "active" : ""}`}
                    onClick={on_click}
                >
                    {chat_tab.name}
                </button>
                {show_edit_tab && (
                    <div className="flex flex-col w-40 panel panel-glass absolute p-1 z-10 animate-fade-in">
                        <button type="button" className="menu-item" onClick={() => { setShowEditTab(false); setShowEditModal(true); }}>Edit</button>
                        <button type="button" className="menu-item" onClick={on_clear_chat}>Clear Chat</button>
                        {settings.chat_log.window.chat_tabs.length > 1 && (
                            <button type="button" className="menu-item" onClick={on_delete}>Delete</button>
                        )}
                    </div>
                )}
            </div>
            <AnimatePresence>
                {show_edit_modal && (
                    <EditModal
                        chat_tab={deep_copy(chat_tab)}
                        index={index}
                        onSave={on_modal_save}
                        onCancel={() => setShowEditModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
