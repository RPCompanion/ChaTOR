import React from "react";

interface SettingsRangeSliderProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}

export default function SettingsRangeSlider({ value, min, max, onChange }: SettingsRangeSliderProps) {
    return (
        <div>
            <input
                type="range"
                value={value}
                min={min}
                max={max}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-white text-xl">
                <span>{min}%</span>
                <span>{max}%</span>
            </div>
        </div>
    );
}
