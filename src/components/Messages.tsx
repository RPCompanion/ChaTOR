import React from "react";
import type { SwtorMessage } from "../lib/network/swtor_message";
import MessageFragment from "./messages/MessageFragment";

interface MessagesProps {
    message: SwtorMessage;
}

export default function Messages({ message }: MessagesProps) {
    return (
        <>
            {message.message_fragments.map((fragment, idx) => (
                <MessageFragment key={idx} fragment={fragment} channel_type={message.channel.type} />
            ))}
        </>
    );
}
