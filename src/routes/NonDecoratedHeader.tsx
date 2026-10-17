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
            className={`h-8 fixed top-0 left-0 right-0 z-50 select-none flex items-center justify-between
                bg-space-950/95 border-b border-holo-500/30
                ${!show_decorations ? "border-x border-t border-holo-500/30" : ""}`}
        >
            <div data-tauri-drag-region className="flex items-center gap-2 px-3 h-full">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember-500 shadow-[0_0_8px_var(--color-ember-500)]"></span>
                <span data-tauri-drag-region className="eyebrow text-[11px] tracking-[0.32em] text-holo-300">ChaTOR</span>
            </div>
            <div className="flex h-full">
                <button type="button" className="icon-btn h-full rounded-none" onClick={on_minimize} title="Minimize">
                    <Minus size={16} />
                </button>
                <button type="button" className="icon-btn h-full rounded-none" onClick={on_maximize} title="Maximize">
                    {is_maximized ? <ArrowSquareDownLeft size={16} /> : <Square size={14} />}
                </button>
                <button
                    type="button"
                    className="icon-btn h-full rounded-none hover:bg-danger-600! hover:text-ink-100!"
                    onClick={on_close}
                    title="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
