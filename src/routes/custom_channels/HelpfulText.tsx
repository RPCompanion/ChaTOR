import React from "react";
import { open_link } from "../../lib/network";

export default function HelpfulText() {
    return (
        <div className="text-center text-lg">
            <p className="text-ink-100">This page allows you to specify any custom channels you have joined in game.</p>
            <span className="text-ink-100">
                For more information on how custom channels work, see{" "}
                <span
                    className="text-ember-400 cursor-pointer"
                    onClick={() => open_link("https://forums.swtor.com/topic/609549-how-to-use-custom-chat-channels/")}
                >
                    here
                </span>
            </span>
            <p className="text-ink-100 text-sm">The channel name should match the in game channel that you joined.</p>
            <p className="text-ink-300 text-sm mt-2">
                Once added, right click a chat tab in the chat log window and choose <b>Edit</b> to show the channel in that tab.
            </p>
        </div>
    );
}
