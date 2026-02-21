import React, { useState } from "react";
import { ArrowsOutCardinal } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { IDNDCustomEmote } from "../../lib/custom_emote_utils";
import VariableSizeButton from "../../lib/buttons/VariableSizeButton";
import { submit_post } from "../../lib/network";

interface CustomEmoteElemProps {
    emote: IDNDCustomEmote;
    favourite?: boolean;
}

export default function CustomEmoteElem({ emote, favourite = false }: CustomEmoteElemProps) {
    const [show_drag_handle, setShowDragHandle] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: emote.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    async function on_click() {
        const response = await submit_post("ButtonEmote", [emote.emote]);
        if (response.is_err()) {
            toast.error(response.unwrap_err());
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative rounded-md"
            onMouseEnter={() => setShowDragHandle(true)}
            onMouseLeave={() => setShowDragHandle(false)}
        >
            <AnimatePresence>
                {show_drag_handle && (
                    <motion.div
                        {...attributes}
                        {...listeners}
                        className="w-4 h-4 -top-1 -left-1 absolute cursor-grab"
                        aria-label={`drag-handle for ${emote.emote_name}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ArrowsOutCardinal className="text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
            <VariableSizeButton
                onClick={on_click}
                my_classes="bg-yellow-500 text-black text-2xl px-2 rounded-md hover:text-white"
            >
                {emote.emote_name}
            </VariableSizeButton>
        </div>
    );
}
