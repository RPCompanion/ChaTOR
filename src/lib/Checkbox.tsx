import React from "react";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    size?: "normal" | "small";
    children?: React.ReactNode;
}

export default function Checkbox({ checked, onChange, size = "normal", children }: CheckboxProps) {
    return (
        <label className={`text-white bg-slate-500 rounded-md shadow-lg p-1 cursor-pointer select-none ${size === "small" ? "text-md" : "text-xl"}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="ml-2 scale-150 cursor-pointer"
            />
            {children}
        </label>
    );
}
