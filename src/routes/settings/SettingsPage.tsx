import React from "react";
import PageFormatting from "../../components/PageFormatting";
import AppSettings from "./AppSettings";
import ChatSection from "./ChatSection";
import ChatManualSection from "./ChatManualSection";
import ChatAutomaticSection from "./ChatAutomaticSection";
import ChatLogging from "./ChatLogging";
import ChatLogWindowSettings from "./ChatLogWindowSettings";
import DeveloperSettings from "./DeveloperSettings";

export default function SettingsPage() {
    return (
        <PageFormatting title="Settings">
            <div className="flex flex-col gap-3">
                <AppSettings />
                <ChatSection />
                <ChatManualSection />
                <ChatAutomaticSection />
                <ChatLogging />
                <ChatLogWindowSettings />
                {import.meta.env.DEV && <DeveloperSettings />}
            </div>
        </PageFormatting>
    );
}
