
import { get } from "svelte/store";
import { settings, type ISettings } from "./network/settings";
import { Result, Ok, Err } from "./result";

import nlp from "compromise";

import { GAME_MESSAGE_MAXIMUM, GAME_MESSAGE_MINIMUM } from "./messages";

export class AutoMessageSplitter {

    private message: string;
    private settings: ISettings;
    private is_whisper: boolean;
    private character_to_whisper?: string;
    private constructor_error?: string;

    constructor(message: string, local_settings?: ISettings) {

        this.message    = message.trim();
        this.is_whisper = this.message.startsWith("/w") || this.message.startsWith("/whisper");

        if (this.is_whisper) {

            let split = this.message.split(":");

            if (split.length < 2) {
                this.constructor_error = "Whisper message malformed";
            }

            this.character_to_whisper = split[0].replace("/whisper", "").replace("/w", "").trim();

        }

        this.settings = local_settings || get(settings);

    }

    public split(): Result<string[], string> {

        if (this.constructor_error) {
            return Result.error(this.constructor_error);
        }

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
        
        return Ok([prefix_result.unwrap()]);

    }

    private get_multi_message_array(): Result<string[], string> {

        let array: string[] = nlp(this.message).sentences().out('array');

        if (array == null) {
            return Err("No valid sentences found.");
        }

        return this.get_constructed_message_array(array);

    }

    private get_constructed_message_array(array: string[]): Result<string[], string> {

        let messages: string[] = [];
        let buffer = "";

        const MAX_SENTENCE_ITERATIONS: number = 250;
        let actual_sentence_iterations: number = 0;
        for (let i = 0; i < array.length; i++) {

            if (actual_sentence_iterations > MAX_SENTENCE_ITERATIONS) {
                return Err("Unable to auto format. One of your sentences is too long.");
            }

            if (array[i].length + " ".length > GAME_MESSAGE_MAXIMUM) {
                return Err("Sentence too long. -> " + array[i] + " <- Unable to auto format");
            }

            let temp = array[i].trim();
            if (buffer.length == 0) {
                temp   = this.remove_starting_pronouns(temp);
                temp   = this.lower_case_starting_character(temp);
                buffer = this.get_prefix(temp);
            }

            if (buffer.length + temp.length + " ".length > GAME_MESSAGE_MAXIMUM) {

                if (buffer == this.get_prefix(array[i].trim())) {
                    return Err("Message too long. -> " + array[i] + " <- Unable to auto format");
                }

                messages.push(buffer.trim());
                buffer = "";
                i--;

            } else {

                buffer += " " + temp;
                
            }

            actual_sentence_iterations++;

        }

        if (buffer.length > 0) {
            messages.push(buffer.trim());
        }

        return Ok(messages);

    }

    private remove_starting_pronouns(message: string): string {

        if (!this.settings.chat.remove_starting_pronouns) {
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

    private lower_case_starting_character(message: string): string {

        if (!this.settings.chat.starting_characters_are_lowercase) {
            return message;
        }

        return message.charAt(0).toLocaleLowerCase() + message.substring(1);

    }

    private prefix_message(message: string): Result<string, string> {

        let t_message = this.get_prefix(message) + " " + message;

        if (t_message.length > GAME_MESSAGE_MAXIMUM) {
            return Err("Message too long. -> " + message + " <- Unable to prefix");
        }

        return Ok(t_message);

    }

    // Assumes string has already been trimmed.
    private get_prefix(message: string): string {

        if (message.startsWith("/")) {
            return "";
        }

        if (this.is_whisper) {
            return "/w " + this.character_to_whisper! + ":";
        }

        if (message.startsWith("\"")) {
            return "/say";
        }

        return "/e"

    }


}