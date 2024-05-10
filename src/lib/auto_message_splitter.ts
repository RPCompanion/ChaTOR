
import { get } from "svelte/store";
import { settings, type ISettings } from "./network/settings";
import { Result } from "./result";

import nlp from "compromise";

import { GAME_MESSAGE_MAXIMUM, GAME_MESSAGE_MINIMUM } from "./messages";

export class AutoMessageSplitter {

    private message: string;
    private settings: ISettings;
    constructor(message: string, local_settings?: ISettings) {

        this.message  = message.trim();
        this.settings = local_settings || get(settings);

    }

    public split(): Result<string[], string> {

        if (this.message.length === 0) {
            return Result.error("No messages to submit");
        }

        if (this.message.length < GAME_MESSAGE_MAXIMUM) {
            return this.get_single_message_array();
        }

        return this.get_multi_message_array();

    }

    private get_single_message_array(): Result<string[], string> {

        let prefix_result = this.prefix_message(this.message);
        if (prefix_result.is_error()) {
            return Result.error(prefix_result.unwrap_error());
        }
        
        return Result.ok([prefix_result.unwrap()]);

    }

    private get_multi_message_array(): Result<string[], string> {

        let array: string[] = nlp(this.message).sentences().out('array');

        if (array == null) {
            return Result.error("No valid sentences found.");
        }

        return this.get_constructed_message_array(array);

    }

    private get_constructed_message_array(array: string[]): Result<string[], string> {

        let messages: string[] = [];
        let buffer = "";

        for (let i = 0; i < array.length; i++) {

            if (array[i].length + " ".length > GAME_MESSAGE_MAXIMUM) {
                return Result.error("Sentence too long. -> " + array[i] + " <- Unable to auto format");
            }

            let temp = array[i].trim();
            if (buffer.length == 0) {
                temp   = this.remove_starting_pronouns(temp);
                buffer = this.get_prefix(temp);
            }

            if (buffer.length + temp.length + " ".length > GAME_MESSAGE_MAXIMUM) {
                messages.push(buffer.trim());
                buffer = "";
                i--;
            } else {
                buffer += " " + temp;
            }

        }

        if (buffer.length > 0) {
            messages.push(buffer.trim());
        }

        return Result.ok(messages);

    }

    private remove_starting_pronouns(message: string): string {

        if (this.settings.chat.remove_starting_pronouns) {
            return message;
        }

        const pronouns = ["i", "you", "he", "her", "she", "it", "we", "they"];
        for (let pronoun of pronouns) {

            if (message.toLocaleLowerCase().startsWith(pronoun + " ")) {
                return message.substring(pronoun.length).trim();
            }
        
        }

        return message;

    }

    private prefix_message(message: string): Result<string, string> {

        let t_message = this.get_prefix(message) + " " + message;

        if (t_message.length > GAME_MESSAGE_MAXIMUM) {
            return Result.error("Message too long. -> " + message + " <- Unable to prefix");
        }

        return Result.ok(t_message);

    }

    // Assumes string has already been trimmed.
    private get_prefix(message: string): string {

        if (message.startsWith("/say") || message.startsWith("/e")) {
            return "";
        }

        if (message.startsWith("\"")) {
            return "/say";
        }

        return "/e"

    }


}