import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";

export default function ChatAutomaticSection() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    return (
        <SettingSection section="Chat - Automatic">
            <Setting setting="Press enter to confirmation screen">
                <SettingsToggle
                    checked={settings.chat.enter_to_post}
                    onChange={(v) => updateSettings((d) => { d.chat.enter_to_post = v; })}
                />
            </Setting>
            <Setting setting="Press enter to post (on confirmation screen)">
                <SettingsToggle
                    checked={settings.chat.enter_to_confirm}
                    onChange={(v) => updateSettings((d) => { d.chat.enter_to_confirm = v; })}
                />
            </Setting>
            <Setting setting="Remove starting pronouns in a post">
                <SettingsToggle
                    checked={settings.chat.remove_starting_pronouns}
                    onChange={(v) => updateSettings((d) => { d.chat.remove_starting_pronouns = v; })}
                />
            </Setting>
            <Setting setting="Set the first character of a post to it's lowercase equivalent">
                <SettingsToggle
                    checked={settings.chat.starting_characters_are_lowercase}
                    onChange={(v) => updateSettings((d) => { d.chat.starting_characters_are_lowercase = v; })}
                />
            </Setting>
        </SettingSection>
    );
}
