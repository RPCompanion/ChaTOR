import React from "react";

interface SettingSectionProps {
    section: string;
    sub_text?: string;
    children?: React.ReactNode;
}

export default function SettingSection({ section, sub_text, children }: SettingSectionProps) {
    return (
        <div className="w-full">
            <div className="text-xl text-white"><b>{section}</b></div>
            {sub_text && <div className="text-sm text-gray-400">{sub_text}</div>}
            <div className="w-full pl-6">{children}</div>
        </div>
    );
}
