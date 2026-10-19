import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CaretLeft, CaretRight, CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";
import XButton from "../lib/buttons/XButton";
import GameTooltipView from "./messages/GameTooltipView";
import { get_game_tooltip, get_item_link, search_game_items, type GameTooltip, type ItemSearchResult } from "../lib/game_data";

interface ItemSearchProps {
    /// Adds `label` ("[Name]") to the message being written; `markup` is the item's chat link,
    /// to post in its place (missing when the game data is unavailable).
    onInsert: (label: string, markup?: string) => void;
}

interface Selection {
    result: ItemSearchResult;
    /// Which of the result's ids (variants) is shown.
    index: number;
}

/// "Items" button on the chat pages: search every item in the game, look at one, add it to the
/// message.
export default function ItemSearch({ onInsert }: ItemSearchProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ItemSearchResult[]>([]);
    const [selected, setSelected] = useState<Selection | undefined>(undefined);
    /// undefined while loading, null when the game data is unavailable.
    const [tooltip, setTooltip] = useState<GameTooltip | null | undefined>(undefined);
    const input_ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        const handle = setTimeout(() => { search_game_items(query).then(setResults); }, 150);
        return () => clearTimeout(handle);
    }, [query, open]);

    useEffect(() => {
        if (!selected) return;
        let cancelled = false;
        setTooltip(undefined);
        get_game_tooltip(BigInt(selected.result.ids[selected.index])).then((r) => {
            if (!cancelled) setTooltip(r.is_ok() ? r.unwrap() : null);
        });
        return () => { cancelled = true; };
    }, [selected]);

    function close() {
        setOpen(false);
        setSelected(undefined);
    }

    function back_to_results() {
        setSelected(undefined);
        setTimeout(() => input_ref.current?.focus(), 0);
    }

    async function insert() {
        if (!selected) return;
        const link = await get_item_link(selected.result.ids[selected.index]);
        onInsert(`[${selected.result.name}]`, link.is_ok() ? link.unwrap() : undefined);
        close();
    }

    function on_key_down(e: React.KeyboardEvent) {
        if (e.key === "Escape") {
            e.preventDefault();
            if (selected) back_to_results(); else close();
        } else if (e.key === "Enter" && !selected && results.length > 0) {
            e.preventDefault();
            setSelected({ result: results[0], index: 0 });
        }
    }

    const variants = selected?.result.ids.length ?? 0;

    return (
        <>
            <button type="button" className="btn btn-ghost btn-sm" title="Search items" onClick={() => setOpen(true)}>
                <MagnifyingGlass size={14} weight="bold" />
                Items
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-20 grid justify-items-center items-start pt-[10vh] bg-space-950/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
                        onKeyDown={on_key_down}
                    >
                        <motion.div
                            className="panel w-[30rem] max-w-[92vw] max-h-[80vh] p-4 flex flex-col gap-3 will-change-[transform,opacity]"
                            initial={{ y: -24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -24, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <div className="flex items-center justify-between">
                                <h1 className="eyebrow">Item search</h1>
                                <XButton onClick={close} />
                            </div>

                            {!selected ? (
                                <>
                                    <input
                                        ref={input_ref}
                                        autoFocus
                                        type="text"
                                        className="input"
                                        placeholder="Search items by name…"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    <div className="min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950 -mx-1">
                                        {query.trim().length < 2 ? (
                                            <p className="text-sm text-ink-300 px-1">Type at least two letters of an item's name.</p>
                                        ) : results.length === 0 ? (
                                            <p className="text-sm text-ink-300 px-1">No items match.</p>
                                        ) : (
                                            results.map((r) => (
                                                <button
                                                    key={r.ids[0]}
                                                    type="button"
                                                    className="menu-item flex items-baseline justify-between gap-3"
                                                    onClick={() => setSelected({ result: r, index: 0 })}
                                                >
                                                    <span>{r.name}</span>
                                                    {r.ids.length > 1 && (
                                                        <span className="flex-none text-xs text-ink-500">{r.ids.length} versions</span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={back_to_results}>
                                            <ArrowLeft size={14} weight="bold" />
                                            Results
                                        </button>
                                        {variants > 1 && (
                                            <div className="flex items-center gap-2 text-xs text-ink-300 select-none">
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    aria-label="Previous version"
                                                    disabled={selected.index === 0}
                                                    onClick={() => setSelected({ ...selected, index: selected.index - 1 })}
                                                >
                                                    <CaretLeft size={14} weight="bold" />
                                                </button>
                                                Version {selected.index + 1} of {variants}
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    aria-label="Next version"
                                                    disabled={selected.index === variants - 1}
                                                    onClick={() => setSelected({ ...selected, index: selected.index + 1 })}
                                                >
                                                    <CaretRight size={14} weight="bold" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="game-tooltip relative min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950">
                                        {tooltip ? (
                                            <GameTooltipView tooltip={tooltip} />
                                        ) : tooltip === null ? (
                                            <p className="game-tooltip-status">{selected.result.name}: details need the game files, which were not found.</p>
                                        ) : (
                                            <p className="game-tooltip-status" role="status">
                                                <CircleNotch size={18} weight="bold" className="animate-spin" />
                                                Loading…
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button type="button" className="btn btn-primary" onClick={insert}>Add to message</button>
                                        <span className="text-xs text-ink-300">
                                            Adds “[{selected.result.name}]” to your message, where it posts as a clickable
                                            item link. In channels like /g that works once someone has posted there this session.
                                        </span>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
