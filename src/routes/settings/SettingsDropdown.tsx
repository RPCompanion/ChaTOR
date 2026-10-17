import React from "react";

interface SettingsDropdownProps {
    options: string[];
    choosen_option: string | null;
    onChange: (option: string | null) => void;
}

export default function SettingsDropdown({ options, choosen_option, onChange }: SettingsDropdownProps) {
    return (
        <select
            name="characters"
            className="input w-44 py-1 text-sm"
            value={choosen_option ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
        >
            <option value="">Select...</option>
            {options.map((option) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    );
}
