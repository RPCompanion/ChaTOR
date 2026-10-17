import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Heart, GithubLogo, DiscordLogo, Folder } from "@phosphor-icons/react";
import { useAppStore } from "../store/useAppStore";
import Checkbox from "../lib/Checkbox";
import { open_link } from "../lib/network";
import CaptureStatusIndicator from "../components/CaptureStatusIndicator";

const appWindow = getCurrentWebviewWindow();

export default function FooterControls() {
    const settings = useAppStore((s) => s.settings);
    const updateSettings = useAppStore((s) => s.updateSettings);
    const [version_string, setVersionString] = useState<string | undefined>(undefined);

    useEffect(() => {
        invoke("get_version").then((response) => {
            setVersionString("v" + response as string);
        });
    }, []);

    useEffect(() => {
        appWindow.setAlwaysOnTop(settings.app.always_on_top);
    }, [settings.app.always_on_top]);

    function open_db_dir() {
        invoke("open_db_dir");
    }

    return (
        <div className="relative w-full flex items-center justify-between px-3 py-1.5 border-t border-holo-500/20 bg-space-950/60">
            <div className="flex items-center gap-1.5 text-xs text-ink-300 select-none">
                <span>Made with</span>
                <Heart size={14} weight="fill" className="text-ember-500" />
                <span>by emmadear</span>
                {version_string && (
                    <span className="ml-3 eyebrow text-[10px] tracking-[0.2em] text-ink-500">{version_string}</span>
                )}
            </div>
            <div className="flex items-center gap-1">
                <CaptureStatusIndicator />
                <Checkbox
                    checked={settings.app.always_on_top}
                    onChange={(v) => updateSettings((draft) => { draft.app.always_on_top = v; })}
                    size="small"
                >
                    Always on top
                </Checkbox>
                <button className="icon-btn" onClick={open_db_dir} title="Open database folder">
                    <Folder size={18} />
                </button>
                <button className="icon-btn" onClick={() => open_link("https://discord.gg/TwfBK94ree")} title="Discord">
                    <DiscordLogo size={18} />
                </button>
                <button className="icon-btn" onClick={() => open_link("https://github.com/Davenport-Physics/SWTOR-Chat")} title="GitHub">
                    <GithubLogo size={18} />
                </button>
            </div>
        </div>
    );
}
