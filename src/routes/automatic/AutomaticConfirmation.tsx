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
                <div className="z-20 w-full h-full absolute left-0 top-0">
                    <motion.div
                        className="flex flex-col gap-2 absolute w-3/4 bg-slate-700 rounded-md border-black border-2"
                        style={{ left: "calc(50% - 37.5%)", top: "100px" }}
                        initial={{ y: -500 }}
                        animate={{ y: 0 }}
                        exit={{ y: -500 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="text-white text-2xl text-center">Auto format - Final edits</div>
                        {messages.map((message, idx) => (
                            <textarea
                                key={idx}
                                className="w-full outline-hidden p-1 rounded-md border-2 resize-none"
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
                            <button type="button" className="bg-slate-800 text-white w-1/2" onClick={onSubmit}>Submit</button>
                            <button type="button" className="bg-slate-800 text-white w-1/2" onClick={onCancel}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
