
import { Result, Ok, Err } from "./result";
import { HyperLinkItem, type ItemCraftable } from "./hyperlink/item";
import { HyperLinkQuest } from "./hyperlink/quest";
import { HyperLinkURL } from "./hyperlink/url";
import { HyperLinkAchievement } from "./hyperlink/achievement";
import { HyperLinkGuild } from "./hyperlink/guild";
import { HyperLinkPVP } from "./hyperlink/pvp";
import { HyperLinkUnknown } from "./hyperlink/unknown";

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export type Hyperlink = HyperLinkItem | HyperLinkQuest | HyperLinkURL | HyperLinkAchievement | HyperLinkGuild | HyperLinkPVP | HyperLinkUnknown;

export function get_hyperlink_regex(): RegExp {
    return /<HL LID="([^"]+)">/g;
}

export function parse_hyperlink(hyperlink: string): Result<Hyperlink, string> {

    const re = get_hyperlink_regex();

    let match = re.exec(hyperlink);
    if (match == null) {
        console.log(hyperlink);
        return Err("Somehow received a malformed hyperlink?");
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

    parse(): Result<Hyperlink, string> {

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

    private get_item(): HyperLinkItem {

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

        return new HyperLinkItem({
            type: "item",
            id: this.read_id(),
            const_false: this.read_boolean() ? true : undefined,
            craftable: get_craftable(),
            modifier: this.text.substring(this.pos, this.pos + 1) === 'C' ? this.read_int() : undefined,
            augmented: this.read_int(),
            mods: [...Array(Number(this.read_int()))].map(() => ({ id: this.read_id(), modifier: this.read_int(), unknown: this.read_int() })),
            final33: this.read_int(),
            remainder: this.get_remainder()
        })

    }

    private get_quest(): HyperLinkQuest {

        return new HyperLinkQuest({
            type: "quest",
            id: this.read_id(),
            const1: this.read_int(),
            quest_step: this.read_int(),
            remainder: this.get_remainder()
        })

    }

    private get_url(): HyperLinkURL {
        
        return new HyperLinkURL({ type: "url", index: this.read_int(), remainder: this.get_remainder()});

    }

    private get_achievement(): HyperLinkAchievement {
        
        return new HyperLinkAchievement({
            type: "achievement",
            id: this.read_id(),
            character: this.read_string(),
            completed: this.read_boolean() && this.read_date(),
            objectives: this.read_final_int_list(),
            remainder: this.get_remainder()
        })

    }

    private get_guild(): HyperLinkGuild {
        
        return new HyperLinkGuild({ type: "guild", id: this.read_id(), name: this.read_string(), remainder: this.get_remainder() });

    }

    private get_pvp(): HyperLinkPVP {

        return new HyperLinkPVP({ 
            type: "pvp",
            char_name: this.read_string(),
            char_id: this.read_id(),
            discipline: this.read_id(),
            queue: ["arena", "warzone"][Number(this.read_int())] ?? "unknown",
            remainder: this.get_remainder()
        })

    }

    private get_unknown(): HyperLinkUnknown {

        return new HyperLinkUnknown({ type: "unknown", remainder: this.get_remainder() });

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