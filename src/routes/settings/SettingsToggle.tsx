import React from "react";

interface SettingsToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function SettingsToggle({ checked, onChange }: SettingsToggleProps) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="scale-150"
        />
    );
}
