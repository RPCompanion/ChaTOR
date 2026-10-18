import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CaretDown } from "@phosphor-icons/react";
import { type INavbarSection, add_navbar_callback, trigger_navbar_callbacks } from "./navbar";

interface NavbarSectionProps {
    section: INavbarSection;
}

export default function NavbarSection({ section }: NavbarSectionProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [show_dropdown, setShowDropdown] = useState(false);

    const is_active =
        section.link === location.pathname ||
        (section.elements?.some((e) => e.link === location.pathname) ?? false);

    function goto_link(link: string) {
        trigger_navbar_callbacks();
        navigate(link);
    }

    function section_click() {
        if (section.link != undefined) {
            goto_link(section.link);
            return;
        }
        trigger_navbar_callbacks(section.name);
        setShowDropdown((v) => !v);
    }

    add_navbar_callback(section.name, () => {
        setShowDropdown(false);
    });

    return (
        <div className="relative flex items-stretch">
            <button
                type="button"
                onClick={section_click}
                className={`nav-item ${is_active ? "active" : ""}`}
            >
                <span>{section.name}</span>
                {section.link == undefined && (
                    <CaretDown
                        size={12}
                        weight="bold"
                        className={`transition-transform ${show_dropdown ? "rotate-180" : ""}`}
                    />
                )}
            </button>
            {show_dropdown && (
                <div className="panel panel-glass absolute top-11 left-0 w-52 p-1 flex flex-col">
                    {section.elements?.map((element) => (
                        <button
                            key={element.name}
                            type="button"
                            onClick={() => goto_link(element.link)}
                            className={`menu-item ${element.link === location.pathname ? "text-holo-300" : ""}`}
                        >
                            {element.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
