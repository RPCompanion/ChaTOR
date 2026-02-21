import React from "react";
import { useAppStore } from "../store/useAppStore";

interface PageFormattingProps {
    title?: string;
    children?: React.ReactNode;
}

export default function PageFormatting({ title, children }: PageFormattingProps) {
    const settings = useAppStore((s) => s.settings);

    return (
        <div className="p-10 relative">
            {title != undefined && settings.app.show_page_header && (
                <>
                    <div className="text-white text-2xl text-center bg-slate-600 select-none">{title}</div>
                    <div className="h-8"></div>
                </>
            )}
            {children}
        </div>
    );
}
