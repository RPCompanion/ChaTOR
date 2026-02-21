import React from "react";
import { useChannelStore } from "../../store/useChannelStore";
import { deep_copy } from "../../lib/utils";
import ExistingElem from "./ExistingElem";

export default function Existing() {
    const custom_channels = useChannelStore((s) => s.customChannels);

    return (
        <div>
            <div className="h-4"></div>
            {custom_channels.map((channel) => (
                <ExistingElem key={channel.custom_channel_id} channel={deep_copy(channel)} />
            ))}
        </div>
    );
}
