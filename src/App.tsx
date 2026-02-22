import React, { useEffect } from "react";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "./routes/Layout";
import AutomaticPage from "./routes/automatic/AutomaticPage";
import ManualPage from "./routes/manual/ManualPage";
import SettingsPage from "./routes/settings/SettingsPage";
import LogViewerPage from "./routes/log_viewer/LogViewerPage";
import CustomEmotesPage from "./routes/custom_emotes/CustomEmotesPage";
import EmoteBoardPage from "./routes/emote_board/EmoteBoardPage";
import CustomChannelsPage from "./routes/custom_channels/CustomChannelsPage";
import StarForgeBeaconsPage from "./routes/star_forge_beacons/StarForgeBeaconsPage";
import { init_network } from "./lib/network";
import { init_window_events } from "./lib/window";
import { init_api } from "./lib/api";
import { setup_chat_log_subscriber } from "./lib/network/settings";

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Navigate to="/automatic" replace /> },
            { path: "automatic", element: <AutomaticPage /> },
            { path: "manual", element: <ManualPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "log_viewer", element: <LogViewerPage /> },
            { path: "custom_emotes", element: <CustomEmotesPage /> },
            { path: "emote_board", element: <EmoteBoardPage /> },
            { path: "custom_channels", element: <CustomChannelsPage /> },
            { path: "star_forge_beacons", element: <StarForgeBeaconsPage /> },
        ],
    },
]);

export default function App() {
    useEffect(() => {
        let cleanups: (() => void)[] = [];

        // init_network handles init_settings, init_hook, init_custom_emotes, init_custom_channels internally
        init_network().then((cleanup) => {
            cleanups.push(cleanup);
        });

        init_window_events().then((cleanup) => {
            cleanups.push(cleanup);
        });

        const cleanup_chat_log = setup_chat_log_subscriber();
        cleanups.push(cleanup_chat_log);

        init_api();

        return () => {
            cleanups.forEach((c) => c());
        };
    }, []);

    return (
        <>
            <ToastContainer position="top-right" />
            <RouterProvider router={router} />
        </>
    );
}
