import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { GAME_MESSAGE_MAXIMUM } from "../../lib/messages";
import { Result } from "../../lib/result";
import { create_custom_emote } from "../../lib/network/custom_emote";
import Checkbox from "../../lib/Checkbox";

interface EmoteModalProps {
    show_modal: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export default function EmoteModal({ show_modal, onSave, onCancel }: EmoteModalProps) {
    const [emote_name, setEmoteName] = useState("");
    const [emote, setEmote] = useState("");
    const [favourite, setFavourite] = useState(true);

    function clear_vars() {
        setEmoteName("");
        setEmote("");
        setFavourite(true);
    }

    function on_cancel() {
        clear_vars();
        onCancel();
    }

    function validate_emote(): Result<[], string> {
        if (emote.length > GAME_MESSAGE_MAXIMUM) return Result.error("Emote is too long.");
        if (emote_name.length === 0) return Result.error("Emote name is empty.");
        if (emote.length === 0) return Result.error("Emote is empty.");
        return Result.ok([]);
    }

    function on_save() {
        const validation = validate_emote();
        if (validation.is_err()) {
            toast.error(validation.unwrap_err());
            return;
        }
        create_custom_emote(emote_name, emote, favourite);
        clear_vars();
        onSave();
    }

    return (
        <AnimatePresence>
            {show_modal && (
                <motion.div
                    className="w-2/3 panel panel-glass py-4 fixed z-50"
                    style={{ top: "calc(33% - 4rem)", left: "calc(50% - 33%)" }}
                    initial={{ y: -500 }}
                    animate={{ y: 0 }}
                    exit={{ y: -500 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="h-8"></div>
                    <div className="flex flex-col w-full gap-2 justify-center items-center">
                        <form
                            className="flex flex-row gap-2 w-4/5"
                            onSubmit={(e) => { e.preventDefault(); on_save(); }}
                        >
                            <input
                                type="text"
                                name="EmoteName"
                                autoComplete="off"
                                placeholder="Emote Name"
                                className="input w-1/2 py-1"
                                value={emote_name}
                                onChange={(e) => setEmoteName(e.target.value)}
                            />
                            <input
                                type="text"
                                name="UniqueEmote"
                                autoComplete="off"
                                placeholder="Emote"
                                className={`input w-1/2 py-1 ${emote.length > GAME_MESSAGE_MAXIMUM ? "border-danger-500!" : ""}`}
                                value={emote}
                                onChange={(e) => setEmote(e.target.value)}
                            />
                            <button type="submit" className="hidden">Submit</button>
                        </form>
                        <div className="flex flex-row items-center gap-2 w-4/5">
                            <Checkbox checked={favourite} onChange={setFavourite} size="small">Favourite</Checkbox>
                            <span className="text-xs text-ink-300">Favourite emotes appear below the message box on the Automatic and Manual chat pages.</span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <button type="button" className="btn btn-primary" onClick={on_save}>Save</button>
                            <button type="button" className="btn" onClick={on_cancel}>Cancel</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
