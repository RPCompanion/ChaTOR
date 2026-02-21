import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";

const PREFETCH_SUBTEXT = "Prevents delays in fetching item and achievements, at the cost of space and bandwidth";

export default function ChatLogWindowSettings() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    if (!settings.chat_log.capture_chat_log) return null;

    return (
        <SettingSection section="Chat Log Window">
            <Setting setting="Show chat log window">
                <SettingsToggle
                    checked={settings.chat_log.window.show_chat_log_window}
                    onChange={(v) => updateSettings((d) => { d.chat_log.window.show_chat_log_window = v; })}
                />
            </Setting>
            {settings.chat_log.window.show_chat_log_window && (
                <Setting setting="Prefetch hyperlinks" sub_text={PREFETCH_SUBTEXT}>
                    <SettingsToggle
                        checked={settings.chat_log.window.prefetch_hyperlinks}
                        onChange={(v) => updateSettings((d) => { d.chat_log.window.prefetch_hyperlinks = v; })}
                    />
                </Setting>
            )}
        </SettingSection>
    );
}
