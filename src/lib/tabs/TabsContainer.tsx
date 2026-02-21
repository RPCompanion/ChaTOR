import React, { useState } from "react";
import Tab from "./Tab";

interface TabsContainerProps {
    tabs: string[];
    onTabSelected: (tab: string) => void;
}

export default function TabsContainer({ tabs, onTabSelected }: TabsContainerProps) {
    const [selected_tab, setSelectedTab] = useState(tabs[0]);

    function on_tab_clicked(tab: string) {
        setSelectedTab(tab);
        onTabSelected(tab);
    }

    return (
        <div className="flex flex-row gap-1">
            {tabs.map((tab) => (
                <Tab key={tab} tab={tab} selected_tab={selected_tab} onTabClicked={on_tab_clicked} />
            ))}
        </div>
    );
}
