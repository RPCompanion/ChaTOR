import React from "react";
import { useAppStore } from "../store/useAppStore";

interface PageFormattingProps {
    title?: string;
    children?: React.ReactNode;
}

export default function PageFormatting({ title, children }: PageFormattingProps) {
    const settings = useAppStore((s) => s.settings);

    return (
        <div className="px-8 py-6 relative">
            {title != undefined && settings.app.show_page_header && (
                <>
                    <div className="title-bar select-none">{title}</div>
                    <div className="h-6"></div>
                </>
            )}
            {children}
        </div>
    );
}
