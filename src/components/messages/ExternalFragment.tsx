import React, { useState, useRef, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import { AnimatePresence, motion } from "framer-motion";
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
    const render_section_ref = useRef<HTMLDivElement>(null);

    const fetch_function: FetchType = fragment instanceof HyperLinkItem ? fetch_item : fetch_achievement;

    function fetch_jediapedia_content() {
        if (content != undefined) return;
        fetch_function(fragment.id, (result) => {
            if (result.is_ok()) {
                setContent(DOMPurify.sanitize(result.unwrap()));
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

    useEffect(() => {
        if (render_section_ref.current && content != undefined) {
            if (render_section_ref.current.innerHTML === "") {
                render_section_ref.current.innerHTML = content;
            }
        }
    }, [content, show_content]);

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
                {show_content && content != undefined && (
                    <motion.div
                        className="fixed top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-center"
                        initial={{ y: -1000 }}
                        animate={{ y: 0 }}
                        exit={{ y: -1000 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="relative w-96 h-96">
                            <div ref={render_section_ref}></div>
                            <div className="absolute right-0 top-0">
                                <XButton onClick={() => setShowContent(false)} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
