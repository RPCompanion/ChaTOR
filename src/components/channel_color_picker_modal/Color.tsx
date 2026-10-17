import React from "react";
import { HexColorPicker } from "react-colorful";
import type { IColor } from "../../lib/network/local_characters";

interface ColorProps {
    text: string;
    color: IColor;
    onColorChange: (color: IColor) => void;
}

export default function Color({ text, color, onColorChange }: ColorProps) {
    // Convert IColor {r,g,b} to hex string for react-colorful
    const to_hex = (c: IColor) =>
        "#" + [c.r, c.g, c.b]
            .map((v) => Math.round(v).toString(16).padStart(2, "0"))
            .join("");

    // Convert hex string back to IColor
    const from_hex = (hex: string): IColor => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
            : color;
    };

    return (
        <div className="grid grid-cols-2">
            <p className="text-ink-100">{text}</p>
            <HexColorPicker color={to_hex(color)} onChange={(hex) => onColorChange(from_hex(hex))} />
        </div>
    );
}
