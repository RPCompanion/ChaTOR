import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import NonDecoratedHeader from "./NonDecoratedHeader";
import FooterControls from "./FooterControls";
import Navbar from "./Navbar";

export default function Layout() {
    const settings = useAppStore((s) => s.settings);
    const show_decorations = settings.app.show_window_decorations;
    const opacity = show_decorations ? 1.0 : settings.app.opacity / 100.0;

    useEffect(() => {
        document.documentElement.dataset.theme = settings.app.theme ?? "lighter";
    }, [settings.app.theme]);

    return (
        // Exactly one window tall: title bar, navbar and footer stay put and only the page
        // between them scrolls.
        <div
            className={`flex flex-col h-screen overflow-hidden text-ink-100 app-shell
                ${!show_decorations ? "border-x border-b border-holo-500/30" : ""}`}
            style={{ opacity }}
        >
            {!show_decorations && (
                <>
                    <NonDecoratedHeader />
                    <div className="h-8 flex-none"></div>
                </>
            )}
            <div className="flex-none">
                <Navbar />
            </div>
            <main className="flex-1 min-h-0 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-holo-900 scrollbar-track-space-950">
                <Outlet />
            </main>
            <div className="flex-none">
                <FooterControls />
            </div>
        </div>
    );
}
