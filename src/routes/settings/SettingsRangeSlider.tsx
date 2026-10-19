import React from "react";

interface SettingsRangeSliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}

export default function SettingsRangeSlider({ value, min, max, step = 1, onChange }: SettingsRangeSliderProps) {
    return (
        <div className="flex items-center gap-3 w-56">
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full cursor-pointer"
            />
            <span className="eyebrow text-ink-200 w-12 text-right tabular-nums">{value}%</span>
        </div>
    );
}
