import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type INavbarSection, add_navbar_callback, trigger_navbar_callbacks } from "./navbar";
import { AnimatePresence, motion } from "framer-motion";

interface NavbarSectionProps {
    section: INavbarSection;
}

export default function NavbarSection({ section }: NavbarSectionProps) {
    const navigate = useNavigate();
    const [show_dropdown, setShowDropdown] = useState(false);

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
        <div className="relative">
            <button
                type="button"
                onClick={section_click}
                className="flex flex-row gap-1 relative text-white px-2 top-2 hover:text-gray-400 select-none"
            >
                <div className="text-xl">{section.name}</div>
                {section.link == undefined && (
                    <div className="relative top-2 text-xs">&#9660;</div>
                )}
            </button>
            <AnimatePresence>
                {show_dropdown && (
                    <motion.div
                        className="flex flex-col gap-1 bg-white p-2 absolute top-10 shadow-md w-36"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {section.elements?.map((element, idx) => (
                            <React.Fragment key={element.name}>
                                <button
                                    type="button"
                                    onClick={() => goto_link(element.link)}
                                    className="hover:text-slate-500 text-center select-none"
                                >
                                    {element.name}
                                </button>
                                {idx !== (section.elements?.length ?? 0) - 1 && (
                                    <div className="border-b-2 border-slate-500"></div>
                                )}
                            </React.Fragment>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
