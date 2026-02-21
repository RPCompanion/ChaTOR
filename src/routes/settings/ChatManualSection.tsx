import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";

export default function ChatManualSection() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    return (
        <SettingSection section="Chat - Manual">
            <Setting setting="Confirm before posting">
                <SettingsToggle
                    checked={settings.chat.confirmation_before_posting}
                    onChange={(v) => updateSettings((d) => { d.chat.confirmation_before_posting = v; })}
                />
            </Setting>
        </SettingSection>
    );
}
