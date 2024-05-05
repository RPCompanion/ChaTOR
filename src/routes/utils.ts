
import { Result } from "../lib/result";

export function valid_messages(messages: string[]): Result<[], string> {

    if (messages.length === 0) {
        return Result.error("No messages to submit");
    }

    for (let message of messages) {

        let temp = message.trim();
        if (temp.length === 0 || temp.length > 255) {
            return Result.error("Messages must be between 1 and 255 characters");
        }

    }

    return Result.ok([]);

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

function remove_starting_pronouns(message: string): string {

    const pronouns = ["i", "you", "he", "she", "it", "we", "they"];
    for (let pronoun of pronouns) {

        if (message.toLocaleLowerCase().startsWith(pronoun + " ")) {
            return message.substring(pronoun.length).trim();
        }
    
    }

    return message;

}

function prefix_message(message: string): Result<string, string> {
    
    if (message.startsWith("/say") || message.startsWith("/e")) {
        return Result.ok(message);
    }

    let t_message = "";
    if (message.startsWith("\"")) {
        t_message = "/say " + message;
    } else {
        t_message = "/e " + message;
    }

    if (t_message.length > 255) {
        return Result.error("Message too long. -> " + message + " <- Unable to prefix");
    }

    return Result.ok(t_message);

}

function split_on_puncutation(message: string): Result<string[], string> {

    let messages = [];

    const reg = new RegExp(/[^.!?]+[.!?]["']?(?=\s|$)/g);
    let array = message.match(reg);
    if (array == null) {
        return Result.error("No valid sentences found.");
    }

    let temp = "";
    for (let i = 0; i < array.length; i++) {

        if (array[i].length > 255) {
            return Result.error("Sentence too long. -> " + array[i] + " <- Unable to auto format");
        }

        let t_a_msg = array[i].trim();
        t_a_msg = remove_starting_pronouns(t_a_msg);
        if (temp.length == 0) {
  
            if (!t_a_msg.startsWith("/say") && !t_a_msg.startsWith("/e")) {
                if (t_a_msg.startsWith("\"")) {
                    temp += "/say";
                } else {
                    temp += "/e";
                }
            }

        }

        if (temp.length + t_a_msg.length + " ".length > 255) {
            messages.push(temp);
            temp = "";
            i--;
        } else {
            temp += " " + t_a_msg;
        }

    }

    if (temp.length > 0) {
        messages.push(temp);
    }

    return Result.ok(messages);

}

export function auto_message_split(message: string): Result<string[], string> {

    let t_message = message.trim();
    if (t_message.length <= 255) {

        let prefixed = prefix_message(t_message);

        if (prefixed.is_error()) {
            return Result.error(prefixed.unwrap_error());
        }
        return Result.ok([prefixed.unwrap()]);

    }

    return split_on_puncutation(t_message);

}