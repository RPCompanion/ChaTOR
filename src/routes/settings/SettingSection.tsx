import React from "react";

interface SettingSectionProps {
    section: string;
    sub_text?: string;
    children?: React.ReactNode;
}

export default function SettingSection({ section, sub_text, children }: SettingSectionProps) {
    return (
        <div className="w-full panel p-4">
            <div className="eyebrow">{section}</div>
            {sub_text && <div className="text-xs text-ink-300 mt-1">{sub_text}</div>}
            <div className="holo-line my-3"></div>
            <div className="w-full">{children}</div>
        </div>
    );
}
