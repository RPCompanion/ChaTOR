
import { Result, Ok, Err } from "./result";

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export class Hyperlink {

    private hyperlink: string;
    constructor(hyperlink: string) {

        this.hyperlink = hyperlink;

    }

    parse(): Result<HyperlinkType, string> {

        const re: RegExp = /<HL LID="([^"]+)">/g;
        let match = this.hyperlink.match(re);
        if (match == null) {
            return Err("Somehow received a malformed hyperlink?")
        }

        return new HyperlinkParser(match[0]).parse();

    }

}

class HyperlinkParser {

    private text: string;
    private pos: number;
    constructor(text: string) { 

        this.text = text;
        this.pos = 0;

    }

    parse(): Result<HyperlinkType, string> {

        let type = Number(this.read_int());

        switch (type) {
            case 2: break;
            case 4: break;
            case 5: break;
            case 6: break;
            case 8: break;
            case 9: break;
            default: break;
        }

        return Err("Unable to parse hyperlink type.");

    }

    private read_int(): bigint {

        const length = this.read_int_with_length(1);
        return this.read_int_with_length(length);

    }

    private read_int_with_length(length: number | bigint): bigint {

        const text = this.read_chars(length);
        let out: bigint = 0n;

        for (let i = 0; i < length; i++) {

            const char = text.substring(i, i + 1);
            const char_index = BASE64_CHARS.indexOf(char);
            out += BigInt(char_index) * 64n ** BigInt(text.length - i - 1);

        }        

        return out;

    }

    private read_chars(length: number | bigint): string {

        this.pos += Number(length);
        return this.text.slice(this.pos - Number(length), this.pos);

    }

    private read_boolean(): boolean {

        return this.read_int_with_length(1) == 1n;

    }

    private read_id(): bigint {
        
        return this.read_int_with_length(11);

    }

    private read_string(): string {
            
        const length = this.read_int();
        return this.read_chars(length);
        
    }

    private read_date(): Date {

        const length = this.read_int();
        const milliseconds = this.read_int_with_length(length);
        const date = new Date(Number(milliseconds));
        date.setFullYear(date.getFullYear() - 369);
        return date;

    }

    private read_final_int_list(): bigint[] {

        const out = [];

        while (this.pos < this.text.length) {
            out.push(this.read_int());
        }

        return out;

    }

    private get_remainder(): string | undefined {

        return this.pos == this.text.length ? undefined : this.text.substring(this.pos);

    }

}

export interface HyperlinkItem {
    type: "item";
    id: string;
}

export interface HyperLinkQuest {
    type: "quest";
    id: string;
    const1: number;
    questStep: string;
    remainder?: string;
}

export interface HyperlinkURL {
    type: "url";
    index: string;
}

export interface HyperlinkAchievement {
    type: "achievement";
    id: string;
    character: string;
    completed: boolean;
    objectives: string[];
    remainder?: string;
}

export interface HyperlinkGuild {
    type: "guild";
    id: string;
    name: string;
    remainder?: string;
}

export interface HyperlinkPVP {
    type: "pvp";
    char_name: string;
    char_id: string;
    discipline: string;
    queue: string;
    remainder?: string;
}

export interface HyperlinkUnkown {
    type: "unknown";
    remainder?: string;
}

export type HyperlinkType = HyperlinkItem | HyperLinkQuest | HyperlinkURL | HyperlinkAchievement | HyperlinkGuild | HyperlinkPVP | HyperlinkUnkown;