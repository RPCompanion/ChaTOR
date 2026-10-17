import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { GAME_MESSAGE_MAXIMUM } from "../../lib/messages";

interface AutomaticConfirmationProps {
    messages: string[];
    show_modal: boolean;
    onMessagesChange: (messages: string[]) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export default function AutomaticConfirmation({
    messages,
    show_modal,
    onMessagesChange,
    onSubmit,
    onCancel,
}: AutomaticConfirmationProps) {
    const settings = useAppStore((s) => s.settings);

    useEffect(() => {
        if (!settings.chat.enter_to_confirm) return;

        function on_keydown(event: KeyboardEvent) {
            if (!show_modal) return;
            if (event.key === "Enter" && !event.shiftKey) {
                onSubmit();
            }
        }

        if (show_modal) {
            const timer = setTimeout(() => window.addEventListener("keydown", on_keydown), 1);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("keydown", on_keydown);
            };
        } else {
            window.removeEventListener("keydown", on_keydown);
        }
    }, [show_modal, settings.chat.enter_to_confirm, onSubmit]);

    return (
        <AnimatePresence>
            {show_modal && (
                <div className="z-20 fixed inset-0 bg-space-950/60 backdrop-blur-[2px]">
                    <motion.div
                        className="panel panel-glass flex flex-col gap-3 absolute w-3/4 p-4"
                        style={{ left: "calc(50% - 37.5%)", top: "100px" }}
                        initial={{ y: -24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -24, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <div className="title-bar">Final edits</div>
                        {messages.map((message, idx) => (
                            <textarea
                                key={idx}
                                className="input resize-none"
                                maxLength={GAME_MESSAGE_MAXIMUM}
                                value={message}
                                onChange={(e) => {
                                    const updated = [...messages];
                                    updated[idx] = e.target.value;
                                    onMessagesChange(updated);
                                }}
                            />
                        ))}
                        <div className="flex flex-row gap-2">
                            <button type="button" className="btn btn-primary w-1/2" onClick={onSubmit}>Submit</button>
                            <button type="button" className="btn w-1/2" onClick={onCancel}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
