import React from "react";
import { useAppStore } from "../../store/useAppStore";
import SettingSection from "./SettingSection";
import SettingsToggle from "./SettingsToggle";
import SettingsRangeSlider from "./SettingsRangeSlider";
import Setting from "./Setting";
import { THEMES, type Theme } from "../../lib/network/settings";

export default function AppSettings() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);

    return (
        <SettingSection section="App Settings">
            <Setting setting="Theme" sub_text="Dark, the default lighter navy, or a light palette.">
                <select
                    className="input w-44 py-1 text-sm"
                    value={settings.app.theme ?? "lighter"}
                    onChange={(e) => updateSettings((d) => { d.app.theme = e.target.value as Theme; })}
                >
                    {THEMES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </Setting>
            <Setting setting="Font size" sub_text="Scales all text and spacing in ChaTOR.">
                <SettingsRangeSlider
                    value={settings.app.font_size ?? 100}
                    min={80}
                    max={150}
                    step={5}
                    onChange={(v) => updateSettings((d) => { d.app.font_size = v; })}
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
