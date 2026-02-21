import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Heart, GithubLogo, DiscordLogo, Folder } from "@phosphor-icons/react";
import { useAppStore } from "../store/useAppStore";
import Checkbox from "../lib/Checkbox";
import { open_link } from "../lib/network";

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
        <>
            {version_string && (
                <div className="text-white text-xl text-end px-1">{version_string}</div>
            )}
            <div className="relative w-full grid grid-cols-2 px-1 pb-1">
                <div className="flex flex-row gap-1">
                    <div className="flex flex-row gap-1">
                        <span className="text-white text-xl">Made with</span>
                        <Heart size={28} color="red" />
                        <span className="text-white text-xl">by emmadear</span>
                    </div>
                </div>
                <div className="flex flex-row-reverse gap-1">
                    <button
                        className="cursor-pointer bg-slate-500 rounded-md px-2"
                        onClick={() => open_link("https://github.com/Davenport-Physics/SWTOR-Chat")}
                    >
                        <GithubLogo size={32} color="white" />
                    </button>
                    <button
                        className="cursor-pointer bg-slate-500 rounded-md px-2"
                        onClick={() => open_link("https://discord.gg/TwfBK94ree")}
                    >
                        <DiscordLogo size={32} color="white" />
                    </button>
                    <button className="cursor-pointer bg-slate-500 rounded-md px-2" onClick={open_db_dir}>
                        <Folder size={32} color="white" />
                    </button>
                    <Checkbox
                        checked={settings.app.always_on_top}
                        onChange={(v) => updateSettings((draft) => { draft.app.always_on_top = v; })}
                    >
                        Always on top
                    </Checkbox>
                </div>
            </div>
        </>
    );
}
