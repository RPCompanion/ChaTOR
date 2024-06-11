
import { Result } from "../lib/result";
import { GAME_MESSAGE_MAXIMUM, GAME_MESSAGE_MINIMUM } from "../lib/messages";
import { unicode_escape } from "../lib/utils";

export function valid_messages(messages: string[]): Result<[], string> {

    if (messages.length === 0) {
        return Result.error("No messages to submit");
    }

    for (let message of messages) {

        let temp = message.trim();
        if (unicode_escape(temp).length < GAME_MESSAGE_MINIMUM || unicode_escape(temp).length > GAME_MESSAGE_MAXIMUM) {
            return Result.error("Messages must be between 1 and 255 characters");
        }

    }

    return Result.ok([]);

}

export function truncate_messages(messages: string[]): string[] {

    return messages
        .map((message) => message.trim())
        .filter((message) => message.length > 0);

}