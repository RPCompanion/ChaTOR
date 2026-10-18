import React, { useState, useRef, useEffect, useCallback } from "react";
import { Gear } from "@phosphor-icons/react";
import { ESwtorChannel } from "./network/swtor_channel";
import { useAppStore } from "../store/useAppStore";
import { useChatLogStore } from "../store/useChatLogStore";
import {
    set_swtor_channel_messages_to_read,
    is_dice_roll,
    type SwtorChatTabMessages,
    type ChatEntry,
} from "./network/swtor_message/swtor_chat_tab_messages";
import type { SwtorMessage } from "./network/swtor_message";
import Checkbox from "./Checkbox";
import ChatTabs from "./chat_log_window/ChatTabs";
import PlayerFilter from "../components/PlayerFilter";
import RestorePosts from "./chat_log_window/RestorePosts";
import Messages from "../components/Messages";
import ChannelColorPickerModal from "../components/ChannelColorPickerModal";
import type { IListElem } from "../components/select_list";

interface ChatLogWindowProps {
    onWhisper: (character_name: string) => void;
}

export default function ChatLogWindow({ onWhisper }: ChatLogWindowProps) {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const active_character = useAppStore((s) => s.activeCharacter);
    const swtor_channel_messages = useChatLogStore((s) => s.swtorChannelMessages);
    const active_chat_tab_index = useChatLogStore((s) => s.activeChatTabIndex);
    const players_filter = useChatLogStore((s) => s.playersFilter);
    const setPlayersFilter = useChatLogStore((s) => s.setPlayersFilter);

    const [auto_scroll, setAutoScroll] = useState(true);
    const [show_channel_color_picker, setShowChannelColorPicker] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const prev_msg_length = useRef(0);

    function get_active_chat_tab_name(index: number): string {
        return settings.chat_log.window.chat_tabs[index]?.name ?? "";
    }

    function get_swtor_channel_messages(
        channel_messages: SwtorChatTabMessages[],
        chat_tab_index: number
    ): ChatEntry[] {
        return (
            channel_messages
                .find((c) => c.chat_tab_name === get_active_chat_tab_name(chat_tab_index))
                ?.messages.filter((m) => {
                    const name = is_dice_roll(m) ? m.player_name : m.from;
                    return players_filter.find((p) => p.value === name)?.selected;
                }) ?? []
        );
    }

    const swtor_messages = get_swtor_channel_messages(swtor_channel_messages, active_chat_tab_index);

    // Mark messages as read when channel messages update
    useEffect(() => {
        if (swtor_channel_messages.length > 0) {
            set_swtor_channel_messages_to_read(get_active_chat_tab_name(active_chat_tab_index));
        }
    }, [swtor_channel_messages, active_chat_tab_index]);

    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (swtor_messages.length !== prev_msg_length.current) {
            prev_msg_length.current = swtor_messages.length;
            if (auto_scroll && lastMessageRef.current) {
                setTimeout(() => {
                    lastMessageRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
                }, 1);
            }
        }
    }, [swtor_messages.length, auto_scroll]);

    // Resize observer for window height persistence
    const savedHeight = useRef(settings.chat_log.window.window.height);
    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.style.height = savedHeight.current + "px";

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === containerRef.current) {
                    // offsetHeight, not contentRect.height: it is the border-box height that
                    // style.height sets above (contentRect leaves out padding + border, so the
                    // window shrank 10px per mount), and a whole number, which the Rust side
                    // needs (height is an i32; a fractional one fails the whole settings save).
                    const newHeight = (entry.target as HTMLElement).offsetHeight;
                    if (newHeight === savedHeight.current) break;
                    savedHeight.current = newHeight;
                    updateSettings((draft) => {
                        draft.chat_log.window.window.height = newHeight;
                    });
                    break;
                }
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    function on_character_click(message: SwtorMessage) {
        if (message.channel.type === ESwtorChannel.WHISPER && message.from === active_character?.character_name) {
            onWhisper(message.to);
            return;
        }
        onWhisper(message.from);
    }

    function on_players_filter_change(elems: IListElem<string>[]) {
        setPlayersFilter(elems);
    }

    return (
        <>
            <div className="w-full grid grid-cols-2">
                <div className="flex flex-row gap-1 w-full">
                    <Checkbox checked={auto_scroll} onChange={setAutoScroll} size="small">Auto scroll</Checkbox>
                    <RestorePosts />
                </div>
                <div className="flex flex-row-reverse relative">
                    <PlayerFilter elems={players_filter} onElemsChange={on_players_filter_change} />
                </div>
            </div>

            <ChannelColorPickerModal show={show_channel_color_picker} onClose={() => setShowChannelColorPicker(false)} />

            <div>
                <div className="grid grid-cols-[1fr_auto]">
                    <ChatTabs />
                    <div className="flex justify-end items-center">
                        <button className="text-ink-100 hover:text-holo-300" aria-label="Channel colors" title="Channel colors" onClick={() => setShowChannelColorPicker(true)}>
                            <Gear size={26} />
                        </button>
                    </div>
                </div>
                <div
                    ref={containerRef}
                    className="flex flex-col h-44 max-h-96 resize-y rounded-tr-sm rounded-b-sm border border-holo-500/30 overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950 chat-container-background p-1 text-sm"
                >
                    {swtor_messages.map((entry, idx) => (
                        <div
                            key={idx}
                            ref={idx === swtor_messages.length - 1 ? lastMessageRef : undefined}
                            className="w-full opacity-100"
                        >
                            {is_dice_roll(entry) ? (
                                <>
                                    <span className="text-ink-500 text-xs tabular-nums">[{entry.timestamp}]</span>
                                    <span className="text-ember-400"> [Random] {entry.player_name} rolls {entry.result_text}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-ink-500 text-xs tabular-nums">[{entry.timestamp}]</span>
                                    <span
                                        className="text-ink-200 cursor-pointer"
                                        onClick={() => on_character_click(entry)}
                                    >
                                        {entry.get_message_from()}
                                    </span>
                                    <Messages message={entry} />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
