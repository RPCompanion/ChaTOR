import React, { useState } from "react";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import Setting from "./Setting";
import { api_url, set_uses_production_api, uses_production_api } from "../../lib/api";

/** Only rendered by dev frontends; release builds always talk to production. */
export default function DeveloperSettings() {
    const [production, setProduction] = useState(uses_production_api);

    return (
        <SettingSection section="Developer" sub_text="Only shown in debug builds.">
            <Setting setting="Use production API" sub_text={`Requests go to ${api_url()}`}>
                <SettingsToggle
                    checked={production}
                    onChange={(v) => {
                        set_uses_production_api(v);
                        setProduction(v);
                    }}
                />
            </Setting>
        </SettingSection>
    );
}
