import React from "react";
import { SealCheck, XCircle } from "@phosphor-icons/react";

interface ValidSettingProps {
    setting: string;
    valid: boolean;
}

export default function ValidSetting({ setting, valid }: ValidSettingProps) {
    return (
        <div className="flex flex-row gap-1">
            <div className="text-white">{setting}</div>
            <div>
                {valid ? <SealCheck size={24} color="green" /> : <XCircle size={24} color="red" />}
            </div>
        </div>
    );
}
