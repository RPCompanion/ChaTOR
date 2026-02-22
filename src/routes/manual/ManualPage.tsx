import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "../../store/useAppStore";
import { submit_post } from "../../lib/network";
import { valid_messages } from "../utils";
import { unicode_escape } from "../../lib/utils";
import PageFormatting from "../../components/PageFormatting";
import Checkbox from "../../lib/Checkbox";
import XButton from "../../lib/buttons/XButton";
import ConfirmationModal from "../../lib/ConfirmationModal";
import StandardMenuButton from "../../lib/buttons/StandardMenuButton";
import CustomEmotesList from "../../components/emotes_list/CustomEmotesList";
import ChatLogWindow from "../../lib/ChatLogWindow";

const MAX_MESSAGES = 5;

export default function ManualPage() {
    const settings = useAppStore((s) => s.settings);
    const [messages, setMessages] = useState<string[]>([""]);
    const [show_modal, setShowModal] = useState(false);
    const [automated_posting, setAutomatedPosting] = useState(true);

    function delete_message(idx: number) {
        setMessages((prev) => prev.filter((_, i) => i !== idx));
    }

    function on_new_message() {
        if (messages.length >= MAX_MESSAGES) {
            toast.error(`You can only have ${MAX_MESSAGES} messages at a time.`);
            return;
        }
        setMessages((prev) => [...prev, ""]);
    }

    function on_post_all() {
        if (messages.length === 1 && messages[0].length === 0) {
            toast.error("You have no content to post.");
            return;
        }
        const trimmed = messages.map((m) => m.trim());
        const message_response = valid_messages(trimmed);
        if (message_response.is_err()) {
            toast.error(message_response.unwrap_err());
            return;
        }
        if (settings.chat.confirmation_before_posting) {
            setShowModal(true);
        } else {
            submit_messages();
        }
    }

    async function submit_messages() {
        setShowModal(false);
        const response = await submit_post("ChatMessage", messages.map((m) => unicode_escape(m)));
        if (response.is_err()) {
            toast.error(response.unwrap_err());
            return;
        }
        if (settings.chat.clear_chat_after_posting) {
            setMessages([""]);
        }
    }

    async function on_single_post(idx: number) {
        const response = await submit_post("ChatMessage", [messages[idx]]);
        if (response.is_err()) {
            toast.error(response.unwrap_err());
        }
    }

    function on_whisper(character_name: string) {
        setMessages((prev) => {
            const updated = [...prev];
            updated[0] = "/w " + character_name + ": ";
            return updated;
        });
    }

    function update_message(idx: number, value: string) {
        setMessages((prev) => {
            const updated = [...prev];
            updated[idx] = value;
            return updated;
        });
    }

    const capture_enabled = settings.chat_log.capture_chat_log;
    const show_chat_log = capture_enabled && settings.chat_log.window.show_chat_log_window;

    return (
        <>
            <PageFormatting title="Manual Formatting Mode">
                <div className="flex flex-col gap-2">
                    {show_chat_log && <ChatLogWindow onWhisper={on_whisper} />}
                    <div className="relative h-6">
                        <Checkbox checked={automated_posting} onChange={setAutomatedPosting} size="small">
                            Automated posting
                        </Checkbox>
                        {!settings.chat.clear_chat_after_posting && (
                            <button
                                type="button"
                                className="bg-slate-700 text-white rounded-sm shadow-sm w-32 absolute right-0 hover:text-gray-300"
                                onClick={() => setMessages([""])}
                            >
                                Clear chat
                            </button>
                        )}
                    </div>
                    {messages.map((message, idx) => {
                        const escaped_len = unicode_escape(message).length;
                        return (
                            <div key={idx} className="relative">
                                <textarea
                                    className={`w-full min-h-24 outline-none p-1 resize-none rounded-md border-2 border-slate-700 chat-container-background text-white
                                        ${escaped_len >= 200 && escaped_len <= 255 ? "border-yellow-400" : ""}
                                        ${escaped_len > 255 ? "border-red-500" : ""}`}
                                    value={message}
                                    onChange={(e) => update_message(idx, e.target.value)}
                                />
                                {idx !== 0 && (
                                    <div className="absolute -right-2 -top-3">
                                        <XButton onClick={() => delete_message(idx)} />
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-0 text-white">{escaped_len}/255</div>
                                {!automated_posting && (
                                    <button
                                        type="button"
                                        className="bg-slate-700 text-white rounded-sm shadow-sm px-2 absolute top-1/3 -right-8 hover:text-gray-300"
                                        onClick={() => on_single_post(idx)}
                                    >
                                        Post
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <div className="w-full h-6 flex flex-row-reverse">
                        <button
                            type="button"
                            className="bg-slate-700 text-white rounded-sm shadow-sm w-32 hover:text-gray-300"
                            onClick={on_new_message}
                        >
                            New
                        </button>
                    </div>
                    {automated_posting && <StandardMenuButton text="Post all" onClick={on_post_all} />}
                    {settings.chat.show_favourite_emotes && (
                        <>
                            <div className="h-6"></div>
                            <CustomEmotesList />
                        </>
                    )}
                </div>
            </PageFormatting>
            <ConfirmationModal show_modal={show_modal} onYes={submit_messages} onNo={() => setShowModal(false)}>
                Are you sure you want to post?
            </ConfirmationModal>
        </>
    );
}
