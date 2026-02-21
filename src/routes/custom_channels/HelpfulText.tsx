import React from "react";
import { open_link } from "../../lib/network";

export default function HelpfulText() {
    return (
        <div className="text-center text-lg">
            <p className="text-white">This page allows you to specify any custom channels you have joined in game.</p>
            <span className="text-white">
                For more information on how custom channels work, see{" "}
                <span
                    className="text-red-400 cursor-pointer"
                    onClick={() => open_link("https://forums.swtor.com/topic/609549-how-to-use-custom-chat-channels/")}
                >
                    here
                </span>
            </span>
            <p className="text-white text-sm">The channel name should match the in game channel that you joined.</p>
        </div>
    );
}
