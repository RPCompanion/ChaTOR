import React from "react";

interface SettingsToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function SettingsToggle({ checked, onChange }: SettingsToggleProps) {
    return (
        <input
            type="checkbox"
            role="switch"
            aria-checked={checked}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="switch"
        />
    );
}
