
export interface ValidMessage {
    valid: boolean;
    reason?: string;
}

export function valid_messages(messages: string[]): ValidMessage {

    if (messages.length === 0) {
        return { valid: false, reason: "No messages to submit" }
    }

    for (let message of messages) {

        let temp = message.trim();
        if (temp.length === 0 || temp.length > 255) {
            return { valid: false, reason: "Messages must be between 1 and 255 characters" }
        }

    }

    return { valid: true }

}

export function truncate_messages(messages: string[]): string[] {

    for (let i = 0; i < messages.length; i++) {
        messages[i] = messages[i].trim()
    }

    for (let i = messages.length - 1; i >= 0; i--) {
            
        if (messages[i].length === 0) {
            messages.splice(i, 1)
        }

    }

    return messages

}