import React from "react";

interface TabProps {
    tab: string;
    selected_tab: string;
    onTabClicked: (tab: string) => void;
}

export default function Tab({ tab, selected_tab, onTabClicked }: TabProps) {
    return (
        <div
            className={`chat-tab cursor-pointer ${selected_tab === tab ? "active" : ""}`}
            onClick={() => onTabClicked(tab)}
        >
            {tab}
        </div>
    );
}
