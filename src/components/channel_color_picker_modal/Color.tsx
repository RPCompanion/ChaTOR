import React from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { CaretDown } from "@phosphor-icons/react";
import type { IColor } from "../../lib/network/local_characters";

interface ColorProps {
    text: string;
    color: IColor;
    open: boolean;
    onToggle: () => void;
    onColorChange: (color: IColor) => void;
}

export function to_hex(c: IColor): string {
    return "#" + [c.r, c.g, c.b]
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("");
}

function from_hex(hex: string, fallback: IColor): IColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : fallback;
}

/// One channel row: a colour dot + name. Clicking the row expands the picker
/// for this channel (the modal keeps at most one row open).
export default function Color({ text, color, open, onToggle, onColorChange }: ColorProps) {
    const hex = to_hex(color);

    return (
        <div className="border-b border-holo-500/10 last:border-b-0">
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center gap-3 py-1.5 px-1 rounded-xs text-left select-none
                    hover:bg-holo-500/8 transition-colors ${open ? "bg-holo-500/8" : ""}`}
                aria-expanded={open}
                aria-label={`Pick color for ${text}`}
            >
                <span
                    className="inline-block w-4 h-4 rounded-full border border-white/30 shrink-0"
                    style={{ backgroundColor: hex, boxShadow: `0 0 8px ${hex}66` }}
                />
                <span className="text-ink-100 text-sm grow">{text}</span>
                <span className="text-ink-500 text-xs tabular-nums uppercase">{hex}</span>
                <CaretDown
                    size={12}
                    weight="bold"
                    className={`text-ink-300 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="pb-3 pt-1 px-1 flex flex-col gap-2 animate-fade-in">
                    <HexColorPicker
                        color={hex}
                        onChange={(h) => onColorChange(from_hex(h, color))}
                        style={{ width: "100%", height: "140px" }}
                    />
                    <div className="flex items-center gap-2">
                        <span className="eyebrow text-[10px]">Hex</span>
                        <HexColorInput
                            color={hex}
                            onChange={(h) => onColorChange(from_hex(h, color))}
                            prefixed
                            className="input py-0.5 text-sm uppercase w-28"
                        />
                        <span
                            className="ml-auto text-sm font-semibold"
                            style={{ color: hex }}
                        >
                            Sample text
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
