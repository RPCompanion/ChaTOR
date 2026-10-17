import React from "react";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: "normal" | "small";
    children?: React.ReactNode;
}

export default function Checkbox({ checked, onChange, size = "normal", children }: CheckboxProps) {
    return (
        <label
            className={`inline-flex items-center gap-2 px-2 py-1 rounded-xs border border-holo-500/25 bg-space-800/70
                text-ink-200 cursor-pointer select-none transition-colors hover:border-holo-500/60 hover:text-ink-100
                ${size === "small" ? "text-xs" : "text-sm"}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="cursor-pointer w-3.5 h-3.5"
            />
            <span>{children}</span>
        </label>
    );
}
