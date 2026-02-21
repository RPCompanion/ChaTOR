import React from "react";

interface SettingProps {
    setting: string;
    sub_text?: string;
    children?: React.ReactNode;
}

export default function Setting({ setting, sub_text, children }: SettingProps) {
    return (
        <div className="grid grid-cols-2 w-full">
            <div className="flex flex-col">
                <div className="text-xl text-white">{setting}</div>
                {sub_text && <div className="text-sm text-gray-400">{sub_text}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
}
