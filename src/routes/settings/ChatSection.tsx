import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";

export default function ChatSection() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    return (
        <SettingSection section="Chat">
            <Setting setting="Clear chat after posting">
                <SettingsToggle
                    checked={settings.chat.clear_chat_after_posting}
                    onChange={(v) => updateSettings((d) => { d.chat.clear_chat_after_posting = v; })}
                />
            </Setting>
            <Setting setting="Show favourite emotes" sub_text="Enables/disables favourite emotes appearing on the automatic/manual pages">
                <SettingsToggle
                    checked={settings.chat.show_favourite_emotes}
                    onChange={(v) => updateSettings((d) => { d.chat.show_favourite_emotes = v; })}
                />
            </Setting>
        </SettingSection>
    );
}
