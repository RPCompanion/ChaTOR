import React, { useRef, useState } from "react";
import { computePosition, type Side } from "@floating-ui/dom";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
    tooltip_text: string;
    placement: Side;
    children: React.ReactNode;
}

export default function Tooltip({ tooltip_text, placement, children }: TooltipProps) {
    const elemRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [show_tooltip, setShowTooltip] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const x_offset = placement === "right" ? 5 : placement === "left" ? -5 : 0;
    const y_offset = placement === "top" ? -5 : placement === "bottom" ? 5 : 0;

    function compute_position() {
        if (!elemRef.current || !tooltipRef.current) return;
        computePosition(elemRef.current, tooltipRef.current, { placement }).then(({ x, y }) => {
            setPos({ x: x + x_offset, y: y + y_offset });
        });
    }

    function show() {
        setShowTooltip(true);
        setTimeout(compute_position, 1);
    }

    function hide() {
        setShowTooltip(false);
    }

    return (
        <>
            <div ref={elemRef} onMouseEnter={show} onMouseLeave={hide}>
                {children}
            </div>
            <AnimatePresence>
                {show_tooltip && (
                    <motion.div
                        ref={tooltipRef}
                        className="text-white text-md absolute bg-slate-600 rounded-md px-2 select-none z-50"
                        style={{ left: pos.x, top: pos.y }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {tooltip_text}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
