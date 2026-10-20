import React from "react";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";
import { set_uses_production_api } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";
import { useAccountStore } from "../../store/useAccountStore";

/** Only rendered by dev frontends; release builds always talk to production. */
export default function DeveloperSettings() {
    const production = useAppStore((s) => s.settings.app.use_production_api ?? false);
    const apiBase = useAccountStore((s) => s.apiBase);

    return (
        <SettingSection section="Developer" sub_text="Only shown in debug builds.">
            <Setting setting="Use production API" sub_text={`Requests go to ${apiBase}`}>
                <SettingsToggle
                    checked={production}
                    onChange={(v) => set_uses_production_api(v)}
                />
            </Setting>
        </SettingSection>
    );
}
