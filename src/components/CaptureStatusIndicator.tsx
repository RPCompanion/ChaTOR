import React from "react";
import { useAppStore, type CaptureStatus } from "../store/useAppStore";
import Tooltip from "./Tooltip";

const LABELS: Record<CaptureStatus, { text: string; help: string; dot: string; pulse?: boolean }> = {
    off:     { text: "Logging off",     help: "Chat logging is disabled. Turn it on under Settings → Chat Logging.", dot: "bg-ink-500" },
    no_game: { text: "Game not found",  help: "Waiting for the SWTOR window. Logging starts automatically once the game is detected.", dot: "bg-ink-500" },
    pending: { text: "Hooking…",        help: "Injecting into the game and installing hooks.", dot: "bg-ember-500", pulse: true },
    active:  { text: "Logging active",  help: "Chat and rolls are being captured.", dot: "bg-holo-500 shadow-[0_0_8px_var(--color-holo-500)]" },
    partial: { text: "Logging partial", help: "Chat is captured, but an optional hook failed.", dot: "bg-ember-500 shadow-[0_0_8px_var(--color-ember-500)]" },
    failed:  { text: "Logging failed",  help: "The chat hook could not be installed. See the log for details.", dot: "bg-danger-500 shadow-[0_0_8px_var(--color-danger-500)]" },
};

/// Always-visible chat capture state (footer). Replaces the old
/// "Chat logging active" toast.
export default function CaptureStatusIndicator() {
    const { status, detail } = useAppStore((s) => s.captureStatus);
    const hooked_in = useAppStore((s) => s.hookedIn);
    const capture_on = useAppStore((s) => s.settings.chat_log.capture_chat_log);

    // Derive the idle states live so the indicator is right before any event fires.
    const effective: CaptureStatus =
        !capture_on ? "off" : !hooked_in ? "no_game" : status === "off" || status === "no_game" ? "pending" : status;
    const label = LABELS[effective];
    const show_detail = detail && effective !== "off" && effective !== "no_game";
    const tooltip = show_detail ? `${label.help}\n\n${detail}` : label.help;

    return (
        <Tooltip placement="top" multiline tooltip_text={tooltip}>
            <div
                className="inline-flex items-center gap-2 px-2 py-1 rounded-xs border border-holo-500/20 bg-space-800/60 text-xs text-ink-300 select-none cursor-default"
                aria-live="polite"
            >
                <span className={`inline-block w-2 h-2 rounded-full ${label.dot} ${label.pulse ? "animate-pulse" : ""}`}></span>
                <span>{label.text}</span>
            </div>
        </Tooltip>
    );
}
