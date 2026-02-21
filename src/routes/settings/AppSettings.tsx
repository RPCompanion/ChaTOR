import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import SettingsRangeSlider from "./SettingsRangeSlider";
import Setting from "./Setting";

export default function AppSettings() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    return (
        <SettingSection section="App Settings">
            <Setting setting="Show background image">
                <SettingsToggle
                    checked={settings.app.show_background_image}
                    onChange={(v) => updateSettings((d) => { d.app.show_background_image = v; })}
                />
            </Setting>
            <Setting setting="Show window decorations" sub_text="Disable setting for a more seamless looking window.">
                <SettingsToggle
                    checked={settings.app.show_window_decorations}
                    onChange={(v) => updateSettings((d) => { d.app.show_window_decorations = v; })}
                />
            </Setting>
            {!settings.app.show_window_decorations && (
                <Setting setting="Window Opacity">
                    <SettingsRangeSlider
                        value={settings.app.opacity}
                        max={100}
                        min={60}
                        onChange={(v) => updateSettings((d) => { d.app.opacity = v; })}
                    />
                </Setting>
            )}
            <Setting setting="Show page headers" sub_text="For a more minimalist look">
                <SettingsToggle
                    checked={settings.app.show_page_header}
                    onChange={(v) => updateSettings((d) => { d.app.show_page_header = v; })}
                />
            </Setting>
        </SettingSection>
    );
}
