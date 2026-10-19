import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAppStore } from "../../store/useAppStore";
import { useChatLogStore } from "../../store/useChatLogStore";
import { submit_post } from "../../lib/network";
import { AutoMessageSplitter } from "../../lib/auto_message_splitter";
import { None, type Option, Some } from "../../lib/option";
import { SwtorChannel } from "../../lib/network/swtor_channel";
import { unicode_escape } from "../../lib/utils";
import { get_custom_channel_number } from "../../lib/network/custom_channels";
import PageFormatting from "../../components/PageFormatting";
import StandardMenuButton from "../../lib/buttons/StandardMenuButton";
import AutomaticConfirmation from "./AutomaticConfirmation";
import CustomEmotesList from "../../components/emotes_list/CustomEmotesList";
import ChatLogWindow from "../../lib/ChatLogWindow";
import CustomCommand from "../../components/CustomCommand";
import RollBar from "../../components/RollBar";
import ItemSearch from "../../components/ItemSearch";
import { add_item_link, apply_item_links, show_item_links, type ItemLink } from "../../lib/item_links";

export default function AutomaticPage() {
    const settings = useAppStore((s) => s.settings);
    const active_chat_tab_index = useChatLogStore((s) => s.activeChatTabIndex);
    const [message, setMessage] = useState("");
    const [links, setLinks] = useState<ItemLink[]>([]);

    /// Appends an item from ItemSearch to the message, with a space before it.
    function insert_text(label: string, markup?: string) {
        setMessage((m) => (m === "" || m.endsWith(" ") ? m : m + " ") + label);
        if (markup) setLinks((l) => add_item_link(l, { label, markup }));
        setTimeout(() => textarea_ref.current?.focus(), 0);
    }
    const [messages, setMessages] = useState<string[]>([]);
    const [show_modal, setShowModal] = useState(false);
    const textarea_ref = useRef<HTMLTextAreaElement>(null);

    function get_custom_command(): Option<string> {
        const default_channel = settings.chat_log.window.chat_tabs[active_chat_tab_index]?.default_channel;
        if (default_channel == null || default_channel == undefined) return None();

        let custom_command: Option<string> = None();
        if ("RegularDispatch" in default_channel) {
            custom_command = new SwtorChannel(default_channel.RegularDispatch).get_command();
        } else {
            get_custom_channel_number(default_channel.CustomDispatch).is_some_cb((channel_number: number) => {
                custom_command = Some("/" + channel_number);
            });
        }
        return custom_command;
    }

    function enable_confirmation_modal() {
        if (message.trim().length === 0) {
            toast.error("You have no content to post.");
            return;
        }
        const custom_command = get_custom_command();
        // Split with the links' markup in place so the length limit counts what is really posted.
        const response = new AutoMessageSplitter(unicode_escape(apply_item_links(message, links)), undefined, custom_command).split();
        if (response.is_err()) {
            toast.error("Error: " + response.unwrap_err());
            return;
        }
        setMessages(response.unwrap().map((m) => show_item_links(m, links)));
        setShowModal(true);
    }

    async function on_submitted() {
        setShowModal(false);
        const response = await submit_post("ChatMessage", messages.map((m) => apply_item_links(m, links)));
        if (response.is_err()) {
            toast.error(response.unwrap_err());
            return;
        }
        if (settings.chat.clear_chat_after_posting) {
            setMessage("");
        }
    }

    function on_key_down(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (!settings.chat.enter_to_post) return;
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            enable_confirmation_modal();
        }
    }

    function on_whisper(character_name: string) {
        setMessage("/w " + character_name + ": ");
        textarea_ref.current?.focus();
    }

    const capture_enabled = settings.chat_log.capture_chat_log;
    const show_chat_log = capture_enabled && settings.chat_log.window.show_chat_log_window;

    return (
        <>
            <PageFormatting title="Automatic Formatting Mode">
                <div className="flex flex-col gap-2">
                    {show_chat_log && <ChatLogWindow onWhisper={on_whisper} />}
                    <div className="relative flex items-center gap-2 h-7">
                        <RollBar />
                        <ItemSearch onInsert={insert_text} />
                        {!settings.chat.clear_chat_after_posting && (
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm absolute right-0"
                                onClick={() => setMessage("")}
                            >
                                Clear chat
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <textarea
                            ref={textarea_ref}
                            className="input min-h-36 resize-none chat-container-background"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={on_key_down}
                        />
                        <div className="absolute bottom-1 right-2 text-xs text-ink-300 select-none tabular-nums">
                            {unicode_escape(message).length}
                        </div>
                        {show_chat_log && <CustomCommand />}
                    </div>
                    <StandardMenuButton text="Post" onClick={enable_confirmation_modal} />
                    {settings.chat.show_favourite_emotes && (
                        <>
                            <div className="h-6"></div>
                            <CustomEmotesList />
                        </>
                    )}
                </div>
            </PageFormatting>
            <AutomaticConfirmation
                messages={messages}
                show_modal={show_modal}
                onMessagesChange={setMessages}
                onSubmit={on_submitted}
                onCancel={() => setShowModal(false)}
            />
        </>
    );
}
