import React, { useState } from "react";
import { DotsSix, Star } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import XButton from "../../lib/buttons/XButton";
import type { ICustomEmote } from "../../lib/network/custom_emote";
import { update_custom_emote, delete_custom_emote, get_next_order_index } from "../../lib/network/custom_emote";

interface EmoteProps {
    emote: ICustomEmote;
    favourite: boolean;
}

export default function Emote({ emote: initial_emote, favourite }: EmoteProps) {
    const [emote, setEmote] = useState(initial_emote);
    const [show_other_buttons, setShowOtherButtons] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: emote.custom_emote_id! });
    const style = { transform: CSS.Transform.toString(transform), transition };

    function toggle_favourite() {
        const updated = {
            ...emote,
            favourite: !emote.favourite,
            order_index: get_next_order_index(!emote.favourite),
        };
        setEmote(updated);
        update_custom_emote(updated);
    }

    function on_name_change(value: string) {
        setEmote((e) => ({ ...e, emote_name: value }));
    }

    function on_emote_change(value: string) {
        setEmote((e) => ({ ...e, emote: value }));
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-row gap-2 px-2 relative"
            onMouseEnter={() => setShowOtherButtons(true)}
            onMouseLeave={() => setShowOtherButtons(false)}
        >
            <input
                type="text"
                value={emote.emote_name}
                onChange={(e) => on_name_change(e.target.value)}
                className={`input w-1/2 py-1 ${favourite ? "border-ember-500/70!" : ""}`}
                onBlur={() => update_custom_emote(emote)}
            />
            <div {...attributes} {...listeners} className="text-ink-100 cursor-grab">
                <DotsSix size={24} />
            </div>
            <input
                type="text"
                value={emote.emote}
                onChange={(e) => on_emote_change(e.target.value)}
                className={`input w-1/2 py-1 ${favourite ? "border-ember-500/70!" : ""}`}
                onBlur={() => update_custom_emote(emote)}
            />
            <AnimatePresence>
                {show_other_buttons && (
                    <>
                        <motion.button
                            className="absolute left-0 bottom-4 text-ember-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={toggle_favourite}
                        >
                            <Star size={24} />
                        </motion.button>
                        <motion.div
                            className="absolute right-0 bottom-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <XButton onClick={() => delete_custom_emote(emote.custom_emote_id!)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
