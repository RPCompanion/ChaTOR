import React, { useState, useRef, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import { AnimatePresence, motion } from "framer-motion";
import { CircleNotch } from "@phosphor-icons/react";
import { useAppStore } from "../../store/useAppStore";
import { HyperLinkItem } from "../../lib/hyperlink/item";
import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";
import { get_name_by_global_id } from "../../lib/game_data";
import { fetch_achievement, fetch_item } from "./utils";
import type { Result } from "../../lib/result";
import XButton from "../../lib/buttons/XButton";

type FetchType = (global_id: bigint, callback: (result: Result<string, string>) => void) => void;

interface ExternalFragmentProps {
    fragment: HyperLinkItem | HyperLinkAchievement;
}

export default function ExternalFragment({ fragment }: ExternalFragmentProps) {
    const settings = useAppStore((s) => s.settings);
    const [name, setName] = useState<string | undefined>(undefined);
    const [show_content, setShowContent] = useState(false);
    const [content, setContent] = useState<string | undefined>(undefined);
    const [fetch_failed, setFetchFailed] = useState(false);
    const fetching = useRef(false);

    const fetch_function: FetchType = fragment instanceof HyperLinkItem ? fetch_item : fetch_achievement;

    function fetch_jediapedia_content() {
        if (content != undefined || fetching.current) return;
        fetching.current = true;
        setFetchFailed(false);
        fetch_function(fragment.id, (result) => {
            fetching.current = false;
            if (result.is_ok()) {
                setContent(DOMPurify.sanitize(result.unwrap()));
            } else {
                setFetchFailed(true);
            }
        });
    }

    useEffect(() => {
        get_name_by_global_id(fragment.id).then((result) => {
            if (result.is_ok()) {
                const resolved_name = result.unwrap();
                setName(resolved_name);
                if (settings.chat_log.window.prefetch_hyperlinks) {
                    fetch_jediapedia_content();
                }
            }
        });
    }, [fragment.id]);

    function on_click() {
        setShowContent((v) => !v);
        if (!show_content) {
            fetch_jediapedia_content();
        }
    }

    return (
        <>
            {name != undefined ? (
                <span className="wrap-break-word text-ember-400 cursor-pointer select-none" onClick={on_click}>
                    {"{" + name + "}"}
                </span>
            ) : (
                <span className="wrap-break-word text-ember-400 select-none">{"<Loading>"}</span>
            )}
            <AnimatePresence>
                {show_content && (
                    // No backdrop-blur here: WebKitGTK can paint a fading backdrop-filter element once
                    // at full opacity before the fade starts, which shows up as a flicker.
                    <motion.div
                        className="fixed inset-0 z-20 grid justify-items-center items-start pt-[12vh] bg-space-950/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onMouseDown={(e) => { if (e.target === e.currentTarget) setShowContent(false); }}
                    >
                        {/* A short drop from inside the window, like the other modals. Sliding in from
                            1000px above made WebKitGTK repaint the card (shadows included) as it entered
                            the view, which flickered until it settled. */}
                        <motion.div
                            className="game-tooltip relative w-[28rem] max-w-[92vw] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950 will-change-[transform,opacity]"
                            initial={{ y: -24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -24, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            {content != undefined ? (
                                // Sanitized by DOMPurify on arrival. Rendered in the same commit as the
                                // card rather than filled in by an effect afterwards, so it never paints empty.
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                            ) : fetch_failed ? (
                                <p className="game-tooltip-status">Couldn't load this from Jedipedia. Close it and click the link to try again.</p>
                            ) : (
                                <p className="game-tooltip-status" role="status">
                                    <CircleNotch size={18} weight="bold" className="animate-spin" />
                                    Fetching from Jedipedia…
                                </p>
                            )}
                            <div className="absolute right-2 top-2">
                                <XButton onClick={() => setShowContent(false)} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
