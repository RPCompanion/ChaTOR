import React from "react";
import { X } from "@phosphor-icons/react";

interface XButtonProps {
    onClick: () => void;
}

export default function XButton({ onClick }: XButtonProps) {
    return (
        <button
            type="button"
            className="w-6 h-6 grid place-items-center rounded-full bg-space-700 border border-holo-500/40 text-ink-200 hover:text-danger-400 hover:border-danger-500 hover:shadow-[0_0_10px_rgb(239_77_77/0.4)] transition-colors"
            onClick={onClick}
            title="Remove"
        >
            <X size={12} weight="bold" />
        </button>
    );
}
