import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowClockwise } from "@phosphor-icons/react";
import { useChatLogStore } from "../../store/useChatLogStore";
import { restore_todays_messages } from "../network/swtor_message/swtor_chat_tab_messages";
import Tooltip from "../../components/Tooltip";

export default function RestorePosts() {
    const show_restore_posts_button = useChatLogStore((s) => s.showRestorePostsButton);
    const setShowRestorePostsButton = useChatLogStore((s) => s.setShowRestorePostsButton);

    function on_restore_posts() {
        setShowRestorePostsButton(false);
        restore_todays_messages();
    }

    return (
        <AnimatePresence>
            {show_restore_posts_button && (
                <motion.div
                    className="flex flex-row gap-1"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <Tooltip tooltip_text="Restore today's posts" placement="right">
                        <button
                            className="text-3xl text-white hover:text-gray-400 cursor-pointer"
                            onClick={on_restore_posts}
                        >
                            <ArrowClockwise />
                        </button>
                    </Tooltip>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
