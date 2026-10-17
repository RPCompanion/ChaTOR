import React from "react";

interface SettingProps {
    setting: string;
    sub_text?: string;
    children?: React.ReactNode;
}

export default function Setting({ setting, sub_text, children }: SettingProps) {
    return (
        <div className="grid grid-cols-[1fr_auto] gap-6 items-center w-full py-2 border-b border-holo-500/10 last:border-b-0">
            <div className="flex flex-col">
                <div className="text-ink-100">{setting}</div>
                {sub_text && <div className="text-xs text-ink-300 mt-0.5">{sub_text}</div>}
            </div>
            <div className="flex items-center justify-end min-w-44">{children}</div>
        </div>
    );
}
