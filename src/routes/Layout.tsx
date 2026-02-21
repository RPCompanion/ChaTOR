import React from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import NonDecoratedHeader from "./NonDecoratedHeader";
import FooterControls from "./FooterControls";
import Navbar from "./Navbar";

export default function Layout() {
    const settings = useAppStore((s) => s.settings);
    const show_decorations = settings.app.show_window_decorations;
    const opacity = show_decorations ? 1.0 : settings.app.opacity / 100.0;

    return (
        <div
            className={`flex flex-col min-h-screen bg-cover bg-no-repeat
                ${!show_decorations ? "border-x border-b border-slate-600" : ""}
                ${settings.app.show_background_image ? "background-img" : "bg-slate-800"}`}
            style={{ opacity }}
        >
            {!show_decorations && (
                <>
                    <NonDecoratedHeader />
                    <div className="h-8"></div>
                </>
            )}
            <div className="flex-grow">
                <Navbar />
                <Outlet />
            </div>
            <FooterControls />
        </div>
    );
}
