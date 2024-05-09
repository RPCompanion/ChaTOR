
import { Result } from "../lib/result";

export const GAME_MESSAGE_MINIMUM = 1;
export const GAME_MESSAGE_MAXIMUM = 255;

export function valid_messages(messages: string[]): Result<[], string> {

    if (messages.length === 0) {
        return Result.error("No messages to submit");
    }

    for (let message of messages) {

        let temp = message.trim();
        if (temp.length < GAME_MESSAGE_MINIMUM || temp.length > GAME_MESSAGE_MAXIMUM) {
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

function remove_starting_pronouns(message: string): string {

    const pronouns = ["i", "you", "he", "her", "she", "it", "we", "they"];
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

    if (t_message.length > GAME_MESSAGE_MAXIMUM) {
        return Result.error("Message too long. -> " + message + " <- Unable to prefix");
    }

    return Result.ok(t_message);

}

function split_on_puncutation(message: string): Result<string[], string> {

    let messages = [];

    /*
        (?:[^.!?]+[.!?]|\b[^.!?]+\b[.!?]{3}|"[^"]*"): This is a non-capturing group that matches three different patterns:
            [^.!?]+[.!?]: Matches a sentence that ends with a single punctuation mark (period, exclamation mark, or question mark).
            \b[^.!?]+\b[.!?]{3}: Matches a sentence that ends with an ellipsis (three consecutive punctuation marks).
            "[^"]*": Matches a quoted speech, treating the entire speech as a single sentence, regardless of its length or internal punctuation.
        (?=\s|$): Positive lookahead assertion that ensures the matched sentence is followed by a whitespace character or the end of the string.
    */

    const reg = new RegExp(/(?:[^.!?]+[.!?]|\b[^.!?]+\b[.!?]{3}|"[^"]*")(?=\s|$)/g);
    let array = message.match(reg);
    if (array == null) {
        return Result.error("No valid sentences found.");
    }

    let temp = "";
    for (let i = 0; i < array.length; i++) {

        if (array[i].length > GAME_MESSAGE_MAXIMUM) {
            return Result.error("Sentence too long. -> " + array[i] + " <- Unable to auto format");
        }

        let t_a_msg = array[i].trim();
        if (temp.length == 0) {
  
            t_a_msg = remove_starting_pronouns(t_a_msg);
            if (!t_a_msg.startsWith("/say") && !t_a_msg.startsWith("/e")) {
                if (t_a_msg.startsWith("\"")) {
                    temp += "/say";
                } else {
                    temp += "/e";
                }
            }

        }

        if (temp.length + t_a_msg.length + " ".length > GAME_MESSAGE_MAXIMUM) {
            messages.push(temp.trim());
            temp = "";
            i--;
        } else {
            temp += " " + t_a_msg;
        }

    }

    if (temp.length > 0) {
        messages.push(temp.trim());
    }

    return Result.ok(messages);

}

export function auto_message_split(message: string): Result<string[], string> {

    let t_message = message.trim();
    if (t_message.length <= GAME_MESSAGE_MAXIMUM) {

        let prefixed = prefix_message(t_message);

        if (prefixed.is_error()) {
            return Result.error(prefixed.unwrap_error());
        }
        return Result.ok([prefixed.unwrap()]);

    }

    return split_on_puncutation(t_message);

}