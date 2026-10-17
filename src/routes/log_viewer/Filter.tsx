import React, { useRef, useState } from "react";
import { Funnel } from "@phosphor-icons/react";
import { useClickOutside } from "../../lib/useClickOutside";
import ChannelList from "../../components/ChannelList";
import SmallButton from "../../lib/buttons/SmallButton";
import Tooltip from "../../components/Tooltip";
import { get_all_channel_ids } from "../../lib/network/swtor_channel";
import type { ChannelDispatcher } from "../../lib/network/settings";

interface FilterProps {
    channel_filters: ChannelDispatcher[];
    onChannelFiltersChange: (filters: ChannelDispatcher[]) => void;
}

export default function Filter({ channel_filters, onChannelFiltersChange }: FilterProps) {
    const [show_filters, setShowFilters] = useState(false);
    const [mouse_over, setMouseOver] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => {
        if (!mouse_over) setShowFilters(false);
    });

    function select_all_channels() {
        onChannelFiltersChange(get_all_channel_ids().map((id) => ({ RegularDispatch: id })));
    }

    function deselect_all_channels() {
        onChannelFiltersChange([]);
    }

    return (
        <>
            <Tooltip tooltip_text="Filter out by channels" placement="left">
                <button
                    className="hover:text-holo-300 text-ink-100"
                    onClick={() => setShowFilters((v) => !v)}
                    onMouseEnter={() => setMouseOver(true)}
                    onMouseLeave={() => setMouseOver(false)}
                >
                    <Funnel size={26} />
                </button>
            </Tooltip>
            {show_filters && (
                <div
                    ref={dropdownRef}
                    className="absolute top-10 z-10 panel panel-glass p-3 animate-fade-in"
                >
                    <ChannelList channels={channel_filters} onChannelInput={onChannelFiltersChange} />
                    <div className="flex flex-row gap-2">
                        <SmallButton onClick={select_all_channels}>Select All</SmallButton>
                        <SmallButton onClick={deselect_all_channels}>Deselect All</SmallButton>
                    </div>
                </div>
            )}
        </>
    );
}
