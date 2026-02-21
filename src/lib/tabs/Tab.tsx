import React from "react";

interface TabProps {
    tab: string;
    selected_tab: string;
    onTabClicked: (tab: string) => void;
}

export default function Tab({ tab, selected_tab, onTabClicked }: TabProps) {
    return (
        <div
            className={`bg-slate-700 text-white p-2 cursor-pointer rounded-t-md ${selected_tab === tab ? "rounded-md" : ""}`}
            onClick={() => onTabClicked(tab)}
        >
            {tab}
        </div>
    );
}
