import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { toast_error } from "../../lib/utils";
import { get_all_local_characters, type ICharacterColorInfo } from "../../lib/network/local_characters";
import type { Result } from "../../lib/result";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import SettingsDropdown from "./SettingsDropdown";
import Setting from "./Setting";

const SECTION_SUB_TEXT =
    "Chat logging uses DLL injection, which is against the TOS of SWTOR and may result in a ban. Use at your own risk.";

export default function ChatLogging() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const shownCharactersError = useAppStore((s) => s.shownCharactersError);
    const setShownCharactersError = useAppStore((s) => s.setShownCharactersError);
    const [characters, setCharacters] = useState<ICharacterColorInfo[]>([]);

    useEffect(() => {
        get_all_local_characters((temp: Result<ICharacterColorInfo[], string>) => {
            if (temp.is_ok()) {
                setCharacters(temp.unwrap());
                return;
            }
            if (shownCharactersError) return;
            setShownCharactersError(true);
            toast_error(temp.unwrap_err());
        });
    }, []);

    return (
        <SettingSection section="Chat Logging" sub_text={SECTION_SUB_TEXT}>
            <Setting setting="Select active character">
                <SettingsDropdown
                    options={characters.map((c) => c.character_name)}
                    choosen_option={settings.chat_log.character_ini_to_pull_from}
                    onChange={(v) => updateSettings((d) => { d.chat_log.character_ini_to_pull_from = v; })}
                />
            </Setting>
            {settings.chat_log.character_ini_to_pull_from != null && (
                <Setting setting="Enable Chat Logging">
                    <SettingsToggle
                        checked={settings.chat_log.capture_chat_log}
                        onChange={(v) => updateSettings((d) => { d.chat_log.capture_chat_log = v; })}
                    />
                </Setting>
            )}
            {settings.chat_log.capture_chat_log && (
                <>
                    <Setting setting="Log Global Chat" sub_text="Logging for the global, trade and pvp channels">
                        <SettingsToggle
                            checked={settings.chat_log.log_global_chat}
                            onChange={(v) => updateSettings((d) => { d.chat_log.log_global_chat = v; })}
                        />
                    </Setting>
                    <Setting setting="Retry submitting unprocessed posts">
                        <SettingsToggle
                            checked={settings.chat_log.retry_message_submission}
                            onChange={(v) => updateSettings((d) => { d.chat_log.retry_message_submission = v; })}
                        />
                    </Setting>
                </>
            )}
            <Setting
                setting="Dynamic offset lookup"
                sub_text="Locate the chat hook by scanning the game at runtime so it keeps working after game updates. Disable to use only the offsets table. Takes effect the next time chat logging starts."
            >
                <SettingsToggle
                    checked={settings.chat_log.dynamic_offset_lookup}
                    onChange={(v) => updateSettings((d) => { d.chat_log.dynamic_offset_lookup = v; })}
                />
            </Setting>
        </SettingSection>
    );
}
