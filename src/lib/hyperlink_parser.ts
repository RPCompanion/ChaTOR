
import { Result, Ok, Err } from "./result";

export const HYPERLINK_RE: RegExp = /<HL LID="([^"]+)">/g;
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function parse_hyperlink(hyperlink: string): Result<HyperlinkType, string> {

    let match = HYPERLINK_RE.exec(hyperlink);
    if (match == null) {
        return Err("Somehow received a malformed hyperlink?")
    }

    return new HyperlinkParser(match[1]).parse();

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
            case 2: return Ok(this.get_item());
            case 4: return Ok(this.get_quest());
            case 5: return Ok(this.get_url());
            case 6: return Ok(this.get_achievement());
            case 8: return Ok(this.get_guild());
            case 9: return Ok(this.get_pvp());
            default: return Ok(this.get_unknown());
        }

    }

    private get_item(): HyperlinkItem {

        let get_craftable = (): ItemCraftable | undefined => {

            if (this.text.substring(this.pos, this.pos + 3) == "OAA") {

                return {
                    schematic: this.read_id(),
                    modifier: this.read_int(),
                    unknown: this.read_int()
                }

            } else if (this.text.substring(this.pos, this.pos + 11) == "AAAAAAAAAAA") {

                return {
                    schematic: this.read_id()
                }

            } else {

                return undefined;

            }

        }

        return {
            type: "item",
            id: this.read_id(),
            const_false: this.read_boolean() ? true : undefined,
            craftable: get_craftable(),
            modifier: this.text.substring(this.pos, this.pos + 1) === 'C' ? this.read_int() : undefined,
            augmented: this.read_int(),
            mods: [...Array(Number(this.read_int()))].map(() => ({ id: this.read_id(), modifier: this.read_int(), unknown: this.read_int() })),
            final33: this.read_int(),
            remainder: this.get_remainder()
        }

    }

    private get_quest(): HyperLinkQuest {

        return {
            type: "quest",
            id: this.read_id(),
            const1: this.read_int(),
            quest_step: this.read_int(),
            remainder: this.get_remainder()
        }

    }

    private get_url(): HyperlinkURL {
        
        return { type: "url", index: this.read_int(), remainder: this.get_remainder()};

    }

    private get_achievement(): HyperlinkAchievement {
        
        return {
            type: "achievement",
            id: this.read_id(),
            character: this.read_string(),
            completed: this.read_boolean() && this.read_date(),
            objectives: this.read_final_int_list(),
            remainder: this.get_remainder()
        }

    }

    private get_guild(): HyperlinkGuild {
        
        return { type: "guild", id: this.read_id(), name: this.read_string(), remainder: this.get_remainder() };

    }

    private get_pvp(): HyperlinkPVP {

        return { 
            type: "pvp",
            char_name: this.read_string(),
            char_id: this.read_id(),
            discipline: this.read_id(),
            queue: ["arena", "warzone"][Number(this.read_int())] ?? "unknown",
            remainder: this.get_remainder()
        }

    }

    private get_unknown(): HyperlinkUnkown {

        return { type: "unknown", remainder: this.get_remainder() };

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
        return this.text.substring(this.pos - Number(length), this.pos);

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

export interface ItemCraftable {
    schematic: bigint;
    modifier?: bigint;
    unknown?: bigint;
}

export interface ItemMod {
    id: bigint;
    modifier: bigint;
    unknown: bigint;
}

export interface HyperlinkItem {
    type: "item";
    id: bigint;
    augmented: bigint;
    const_false?: true;
    craftable?: ItemCraftable;
    modifier?: bigint;
    mods: ItemMod[];
    final33: bigint;
    remainder?: string;
}

export interface HyperLinkQuest {
    type: "quest";
    id: bigint;
    const1: bigint;
    quest_step: bigint;
    remainder?: string;
}

export interface HyperlinkURL {
    type: "url";
    index: bigint;
    remainder?: string;
}

export interface HyperlinkAchievement {
    type: "achievement";
    id: bigint;
    character: string;
    completed: false | Date;
    objectives: bigint[];
    remainder?: string;
}

export interface HyperlinkGuild {
    type: "guild";
    id: bigint;
    name: string;
    remainder?: string;
}

export interface HyperlinkPVP {
    type: "pvp";
    char_name: string;
    char_id: bigint;
    discipline: bigint;
    queue: string;
    remainder?: string;
}

export interface HyperlinkUnkown {
    type: "unknown";
    remainder?: string;
}

export type HyperlinkType = HyperlinkItem | HyperLinkQuest | HyperlinkURL | HyperlinkAchievement | HyperlinkGuild | HyperlinkPVP | HyperlinkUnkown;