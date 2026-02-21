import React, { useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { X, Square, Minus, ArrowSquareDownLeft } from "@phosphor-icons/react";
import { useAppStore } from "../store/useAppStore";

const appWindow = getCurrentWebviewWindow();

export default function NonDecoratedHeader() {
    const settings = useAppStore((s) => s.settings);
    const show_decorations = settings.app.show_window_decorations;
    const [is_maximized, setIsMaximized] = useState(false);

    function on_close() {
        appWindow.close();
    }

    function on_minimize() {
        appWindow.minimize();
    }

    async function on_maximize() {
        if (await appWindow.isMaximized()) {
            appWindow.unmaximize();
            setIsMaximized(false);
            return;
        }
        await appWindow.maximize();
        setIsMaximized(true);
    }

    return (
        <div
            data-tauri-drag-region
            className={`h-8 bg-slate-700 flex flex-row gap-1 fixed top-0 left-0 right-0 select-none justify-end z-50
                ${!show_decorations ? "border-x border-t border-slate-600" : ""}`}
        >
            <button type="button" className="text-white hover:bg-slate-800 px-1" onClick={on_minimize}>
                <Minus size={22} />
            </button>
            <button type="button" className="text-white hover:bg-slate-800 px-1" onClick={on_maximize}>
                {is_maximized ? <ArrowSquareDownLeft size={22} /> : <Square size={22} />}
            </button>
            <button type="button" className="text-white hover:bg-red-800 px-1" onClick={on_close}>
                <X size={22} />
            </button>
        </div>
    );
}
