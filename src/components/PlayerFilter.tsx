import React, { useRef, useState } from "react";
import { UserList } from "@phosphor-icons/react";
import { useClickOutside } from "../lib/useClickOutside";
import SmallButton from "../lib/buttons/SmallButton";
import SelectList from "./SelectList";
import Tooltip from "./Tooltip";
import type { IListElem } from "./select_list";

interface PlayerFilterProps {
    elems: IListElem<string>[];
    onElemsChange: (elems: IListElem<string>[]) => void;
}

export default function PlayerFilter({ elems, onElemsChange }: PlayerFilterProps) {
    const [mouse_over, setMouseOver] = useState(false);
    const [show_filters, setShowFilters] = useState(false);
    const [player_search, setPlayerSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => {
        if (!mouse_over) {
            setShowFilters(false);
            setPlayerSearch("");
        }
    });

    function toggle_show_filters() {
        setShowFilters((v) => !v);
        setPlayerSearch("");
    }

    function select_all() {
        onElemsChange(elems.map((e) => ({ ...e, selected: true })));
    }

    function deselect_all() {
        onElemsChange(elems.map((e) => ({ ...e, selected: false })));
    }

    return (
        <>
            <Tooltip placement="left" tooltip_text="Filter out players">
                <button
                    className="hover:text-holo-300 text-ink-100"
                    onClick={toggle_show_filters}
                    onMouseEnter={() => setMouseOver(true)}
                    onMouseLeave={() => setMouseOver(false)}
                >
                    <UserList size={26} />
                </button>
            </Tooltip>
            {show_filters && (
                <div
                    ref={dropdownRef}
                    className="absolute top-10 z-10 panel panel-glass p-3 animate-fade-in w-64"
                >
                    <div className="eyebrow text-center mb-2">Players</div>
                    <div className="w-full">
                        <input
                            type="text"
                            value={player_search}
                            onChange={(e) => setPlayerSearch(e.target.value)}
                            placeholder="Search for player"
                            className="input py-1 text-sm"
                        />
                    </div>
                    <div className="h-2"></div>
                    <div className="max-h-96 overflow-y-auto">
                        <SelectList
                            elems={elems}
                            onInput={onElemsChange}
                            search={player_search.toLowerCase()}
                        />
                    </div>
                    <div className="h-2"></div>
                    <div className="flex flex-row gap-2">
                        <SmallButton onClick={select_all}>Select All</SmallButton>
                        <SmallButton onClick={deselect_all}>Deselect All</SmallButton>
                    </div>
                </div>
            )}
        </>
    );
}
