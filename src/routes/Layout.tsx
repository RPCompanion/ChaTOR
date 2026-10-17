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
        <div
            className={`flex flex-col min-h-screen text-ink-100 app-shell
                ${!show_decorations ? "border-x border-b border-holo-500/30" : ""}`}
            style={{ opacity }}
        >
            {!show_decorations && (
                <>
                    <NonDecoratedHeader />
                    <div className="h-8"></div>
                </>
            )}
            <div className="grow flex flex-col">
                <Navbar />
                <Outlet />
            </div>
            <FooterControls />
        </div>
    );
}
