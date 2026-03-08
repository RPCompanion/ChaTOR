import React, { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { type IChatLogMessage } from "../../lib/network/chat_log_message";
import { SwtorMessage } from "../../lib/network/swtor_message";
import { DiceRoll, type IDiceRoll } from "../../lib/network/dice_roll";
import { type ChatEntry, is_dice_roll } from "../../lib/network/swtor_message/swtor_chat_tab_messages";
import { get_all_channel_dispatch } from "../../lib/network/swtor_channel";
import { date_tag_new, get_all_date_tag_favourites, type IDateTag } from "../../lib/network/datetags";
import PageFormatting from "../../components/PageFormatting";
import SmallButton from "../../lib/buttons/SmallButton";
import Filter from "./Filter";
import PlayerFilter from "../../components/PlayerFilter";
import Favourite from "./Favourite";
import Checkbox from "../../lib/Checkbox";
import Messages from "../../components/Messages";
import type { ChannelDispatcher } from "../../lib/network/settings";
import type { IListElem } from "../../components/select_list";
import { get_time_elapsed_since } from "../../lib/utils";

export default function LogViewerPage() {
    const [channel_filters, setChannelFilters] = useState<ChannelDispatcher[]>(get_all_channel_dispatch());
    const [all_dates, setAllDates] = useState<string[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [date_messages, setDateMessages] = useState<ChatEntry[]>([]);
    const [players, setPlayers] = useState<IListElem<string>[]>([]);
    const [filtered_messages, setFilteredMessages] = useState<ChatEntry[]>([]);
    const [active_date, setActiveDate] = useState<string | undefined>(undefined);
    const [date_tags, setDateTags] = useState<IDateTag[]>([]);
    const [show_only_favourites, setShowOnlyFavourites] = useState(false);
    const last_message_ref = useRef<HTMLDivElement>(null);

    const channel_numbers = channel_filters
        .filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c)
        .map((c) => c.RegularDispatch);

    function set_filtered_messages(d_messages = date_messages, p = players, cn = channel_numbers) {
        setFilteredMessages(
            d_messages
                .filter((m) => {
                    if (is_dice_roll(m)) return true; // always show dice rolls
                    return cn.includes(m.channel.type);
                })
                .filter((m) => {
                    const name = is_dice_roll(m) ? m.player_name : m.from;
                    return p.find((p) => p.value === name)?.selected;
                })
        );
    }

    useEffect(() => {
        set_filtered_messages(date_messages, players, channel_numbers);
    }, [channel_filters, players]);

    useEffect(() => {
        if (last_message_ref.current) {
            last_message_ref.current.scrollIntoView({ behavior: "instant", block: "end" });
        }
    }, [filtered_messages]);

    async function init_dates() {
        const response = await invoke("get_distinct_dates") as string[];
        setAllDates(response);
        setDates(response);

        const tags_response = await get_all_date_tag_favourites();
        if (tags_response.is_err()) return;

        const tags = tags_response.unwrap();
        response.forEach((date) => {
            if (!tags.find((t) => t.date === date)) {
                tags.push(date_tag_new(date));
            }
        });
        setDateTags(tags);
    }

    useEffect(() => {
        init_dates();
    }, []);

    interface IDiceRollLogEntry {
        dice_roll_log_id: number;
        character_name: string;
        timestamp: string;
        result_text: string;
    }

    function on_change(selected_dates: Date[], dateStr: string) {
        setActiveDate(dateStr);
        Promise.all([
            invoke("get_chat_log_from_date", { date: dateStr }),
            invoke("get_dice_rolls_for_date", { date: dateStr }),
        ]).then(([chatResponse, rollResponse]) => {
            const chatMsgs: ChatEntry[] = (chatResponse as IChatLogMessage[]).map((m) => new SwtorMessage(m.message));
            const rollMsgs: ChatEntry[] = (rollResponse as IDiceRollLogEntry[]).map((r) => new DiceRoll({
                timestamp: r.timestamp,
                player_name: r.character_name,
                result_text: r.result_text,
            }));

            const all: ChatEntry[] = [...chatMsgs, ...rollMsgs].sort((a, b) => {
                const tA = is_dice_roll(a) ? a.timestamp : a.timestamp;
                const tB = is_dice_roll(b) ? b.timestamp : b.timestamp;
                return tA.localeCompare(tB);
            });

            const player_names = [...new Set(all.map((m) => is_dice_roll(m) ? m.player_name : m.from))];
            const p = player_names.map((name) => ({ value: name, selected: true }));
            setDateMessages(all);
            setPlayers(p);
            set_filtered_messages(all, p, channel_numbers);
        });
    }

    function on_change_show_favourites(checked: boolean) {
        const show = date_tags.filter((dt) => dt.favourite).length > 0 ? checked : false;
        setShowOnlyFavourites(show);
        if (show) {
            setDates(date_tags.filter((dt) => dt.favourite).map((dt) => dt.date));
        } else {
            setDates(all_dates);
        }
        setDateMessages([]);
        setFilteredMessages([]);
        setPlayers([]);
    }

    async function on_export() {
        const filepath = await save({ filters: [{ name: "Text Files", extensions: ["txt"] }] });
        if (!filepath) return;

        const lines = filtered_messages.map((m) => {
            if (is_dice_roll(m)) {
                return `[${m.timestamp}] [Random] ${m.player_name} rolls ${m.result_text}`;
            }
            let flat_message = "";
            m.message_fragments.forEach((f) => {
                if (typeof f === "string") {
                    flat_message += f + " ";
                } else {
                    flat_message += f.as_string().unwrap_or("");
                }
            });
            return `[${m.timestamp}] ${m.get_message_from()} ${flat_message.trim()}`;
        });

        await writeTextFile(filepath, lines.join("\n\n"));
    }

    function on_date_tag_change(updated: IDateTag) {
        setDateTags((prev) => prev.map((dt) => (dt.date === updated.date ? updated : dt)));
    }

    const fav_dates = date_tags.filter((dt) => dt.favourite);

    return (
        <PageFormatting title="Log Viewer">
            <div className="grid grid-cols-2 w-full">
                <div className="w-full">
                    <Flatpickr
                        options={{ enable: dates }}
                        onChange={on_change}
                        placeholder="Select a date"
                        className="outline-none border-2 border-slate-700 rounded-md px-2 text-xl"
                    />
                </div>
                <div className="flex flex-row-reverse relative w-full gap-2">
                    <Filter channel_filters={channel_filters} onChannelFiltersChange={setChannelFilters} />
                    <PlayerFilter elems={players} onElemsChange={setPlayers} />
                </div>
            </div>
            {fav_dates.length > 0 && (
                <>
                    <div className="h-2"></div>
                    <div>
                        <Checkbox size="small" checked={show_only_favourites} onChange={on_change_show_favourites}>
                            Show only favorite dates
                        </Checkbox>
                    </div>
                </>
            )}
            <div className="h-6"></div>
            <div className="flex flex-col h-96 resize-y max-h-full rounded-tr-md border-2 border-slate-700 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-slate-100 chat-container-background">
                {filtered_messages.map((entry, idx) => (
                    <div
                        key={idx}
                        ref={idx === filtered_messages.length - 1 ? last_message_ref : undefined}
                        className="w-full opacity-100"
                    >
                        {is_dice_roll(entry) ? (
                            <>
                                <span className="text-white">[{entry.timestamp}]</span>
                                <span className="text-yellow-300"> [Random] {entry.player_name} rolls {entry.result_text}</span>
                            </>
                        ) : (
                            <>
                                <span className="text-white">[{entry.timestamp}]</span>
                                <span className="text-slate-200 cursor-pointer">{entry.get_message_from()}</span>
                                <Messages message={entry} />
                            </>
                        )}
                    </div>
                ))}
            </div>
            {filtered_messages.length > 0 && (
                <>
                    <div className="h-6"></div>
                    <div className="grid grid-cols-2 w-full">
                        <div className="w-full">
                            <Favourite
                                date_tag={date_tags.find((dt) => dt.date === active_date)}
                                onChange={on_date_tag_change}
                            />
                        </div>
                        <div className="flex flex-row-reverse w-full">
                            <SmallButton onClick={on_export}>Export</SmallButton>
                        </div>
                    </div>
                </>
            )}
        </PageFormatting>
    );
}
