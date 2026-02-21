import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { useChatLogStore } from "../../store/useChatLogStore";
import ChatTab from "./ChatTab";
import EditModal from "./EditModal";
import { add_swtor_channel, set_swtor_channel_messages_to_read } from "../network/swtor_message/swtor_chat_tab_messages";
import type { IChatTab } from "../network/settings";
import { deep_copy } from "../utils";

export default function ChatTabs() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const active_chat_tab_index = useChatLogStore((s) => s.activeChatTabIndex);
    const [show_edit_modal, setShowEditModal] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor));

    const chat_tabs = settings.chat_log.window.chat_tabs;
    const items = chat_tabs.map((_, index) => index);

    function on_modal_save(new_tab: IChatTab) {
        updateSettings((draft) => {
            draft.chat_log.window.chat_tabs.push(new_tab);
        });
        setShowEditModal(false);
        add_swtor_channel(new_tab.name);
    }

    function on_drag_end(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const old_index = items.indexOf(active.id as number);
        const new_index = items.indexOf(over.id as number);
        const reordered = arrayMove(chat_tabs, old_index, new_index);
        updateSettings((draft) => {
            draft.chat_log.window.chat_tabs = reordered;
        });
        set_swtor_channel_messages_to_read(reordered[active_chat_tab_index]?.name ?? "");
    }

    return (
        <div className="flex flex-row gap-1 relative">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={on_drag_end}>
                <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                    <div className="flex flex-row gap-1 relative">
                        {chat_tabs.map((chat_tab, index) => (
                            <ChatTab key={index} chat_tab={deep_copy(chat_tab)} index={index} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="relative">
                <button
                    type="button"
                    className="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400 select-none"
                    onClick={() => setShowEditModal(true)}
                >
                    +
                </button>
                <AnimatePresence>
                    {show_edit_modal && (
                        <EditModal
                            onSave={on_modal_save}
                            onCancel={() => setShowEditModal(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
