
export function valid_messages(messages: string[]): boolean {

    if (messages.length === 0) {
        return false
    }

    for (let message of messages) {

        if (message.trim().length === 0) {
            return false
        }

    }

    return true

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