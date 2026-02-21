import React, { useRef } from "react";
import { trigger_navbar_callbacks, type INavbarSection } from "../lib/navbar/navbar";
import NavbarSection from "../lib/navbar/NavbarSection";
import { useAppStore } from "../store/useAppStore";
import { useClickOutside } from "../lib/useClickOutside";
import type { ISettings } from "../lib/network/settings";

const EMOTE_SECTION: INavbarSection = {
    name: "Emotes",
    elements: [
        { name: "Add/Edit Emotes", link: "/custom_emotes" },
        { name: "Emote Board", link: "/emote_board" },
    ],
};

const SETTINGS_SECTION: INavbarSection = {
    name: "Settings",
    link: "/settings",
};

const ROLEPLAY_SECTION: INavbarSection = {
    name: "Roleplay",
    elements: [
        { name: "Star Forge Beacons", link: "/star_forge_beacons" },
    ],
};

function get_chat_section(settings: ISettings): INavbarSection {
    const chat_section: INavbarSection = {
        name: "Chat",
        elements: [
            { name: "Manual", link: "/manual" },
            { name: "Automatic", link: "/automatic" },
        ],
    };

    if (settings.chat_log.capture_chat_log) {
        chat_section.elements?.push({ name: "Log Viewer", link: "/log_viewer" });
        chat_section.elements?.push({ name: "Add/Edit Custom Channels", link: "/custom_channels" });
    }

    return chat_section;
}

export default function Navbar() {
    const settings = useAppStore((s) => s.settings);
    const chat_section = get_chat_section(settings);
    const navRef = useRef<HTMLDivElement>(null);

    useClickOutside(navRef, () => trigger_navbar_callbacks());

    return (
        <div ref={navRef} className="w-full h-12 bg-slate-700 relative shadow-md grid grid-cols-2 z-10">
            <div className="flex flex-row gap-2">
                <NavbarSection section={chat_section} />
                <NavbarSection section={EMOTE_SECTION} />
                <NavbarSection section={ROLEPLAY_SECTION} />
            </div>
            <div className="flex flex-row-reverse">
                <NavbarSection section={SETTINGS_SECTION} />
            </div>
        </div>
    );
}
