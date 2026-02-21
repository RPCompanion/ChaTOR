import React from "react";
import AppSettings from "./AppSettings";
import ChatSection from "./ChatSection";
import ChatManualSection from "./ChatManualSection";
import ChatAutomaticSection from "./ChatAutomaticSection";
import ChatLogging from "./ChatLogging";
import ChatLogWindowSettings from "./ChatLogWindowSettings";

export default function SettingsPage() {
    return (
        <>
            <div className="relative text-center text-2xl bg-slate-800 opacity-95 text-white h-12">Settings</div>
            <div className="relative bg-slate-800 opacity-95 rounded-b-sm shadow-md p-2 flex flex-col gap-2">
                <AppSettings />
                <ChatSection />
                <ChatManualSection />
                <ChatAutomaticSection />
                <ChatLogging />
                <ChatLogWindowSettings />
            </div>
        </>
    );
}
