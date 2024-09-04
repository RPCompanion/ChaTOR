
import { invoke } from "@tauri-apps/api";
import { writable, get } from "svelte/store";
import { settings } from "./settings";
import { ESwtorChannel } from "./swtor_channel";
import { Result, Ok, Err } from "../result";

export class Color {

    public r: number;
    public g: number;
    public b: number;

    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public equals(other: Color): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b;
    }

    public to_hex(): string {
        return "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }

}

export class CharacterColorInfo implements ICharacterColorInfo {
    
    public character_name: string;
    public channel_colors: Color[];

    constructor(character: ICharacterColorInfo) {
        this.character_name = character.character_name;
        this.channel_colors = character.channel_colors;
    }

    public relevant_channel_color(color: Color): boolean {

        for (let i = 0; i < 4; i++) {

            if (this.channel_colors[i].equals(color)) {
                return true;
            }

        }

        return false;

    }

    public get_channel_color(channel: ESwtorChannel): Color {

        switch (channel) {
            case ESwtorChannel.SAY: return this.channel_colors[SAY_COLOR_INDEX];
            case ESwtorChannel.YELL: return this.channel_colors[YELL_COLOR_INDEX];
            case ESwtorChannel.EMOTE: return this.channel_colors[EMOTE_COLOR_INDEX];
            case ESwtorChannel.WHISPER: return this.channel_colors[WHISPER_COLOR_INDEX];
            case ESwtorChannel.GUILD: return this.channel_colors[GUILD_COLOR_INDEX];
            case ESwtorChannel.GUILD_OFFICER: return this.channel_colors[GUILD_COLOR_INDEX];
            case ESwtorChannel.GROUP: return this.channel_colors[GROUP_COLOR_INDEX];
            case ESwtorChannel.OP: return this.channel_colors[OPS_COLOR_INDEX];
            case ESwtorChannel.OPS_OFFICER: return this.channel_colors[OPS_LEADER_COLOR_INDEX];
            default: return this.channel_colors[SAY_COLOR_INDEX];
        }

    }

    
}

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export interface ICharacterColorInfo {
    character_name: string;
    channel_colors: Color[];
}

export const OPS_LEADER_COLOR_INDEX: number = 29;
export const OPS_COLOR_INDEX: number     = 12;
export const GUILD_COLOR_INDEX: number   = 10;
export const GROUP_COLOR_INDEX: number   = 9;
export const WHISPER_COLOR_INDEX: number = 3;
export const EMOTE_COLOR_INDEX: number   = 2;
export const YELL_COLOR_INDEX: number    = 1;
export const SAY_COLOR_INDEX: number     = 0;

export const active_character = writable<CharacterColorInfo | undefined>(undefined);

export function get_all_character_colors(callback: (characters: Result<ICharacterColorInfo[], string>) => void) {

    invoke("get_all_character_colors").then((response: any) => {

        let temp: ICharacterColorInfo[] = response.map((c: any) => {
            return {
                character_name: c.character_name,
                channel_colors: c.channel_colors.map((cc: IColor) => new Color(cc.r, cc.g, cc.b))
            }
        });
        callback(Ok(temp));

    })
    .catch((error: string) => {
        callback(Err(error));
    });

}

export function init_active_character_color() {

    get_all_character_colors((characters: Result<ICharacterColorInfo[], string>) => {

        if (characters.is_err()) {
            return;
        }

        let character_name = get(settings).chat_log.character_ini_to_pull_from;

        if (character_name == undefined) {
            return;
        }

        let character = characters
            .unwrap()
            .find((c: ICharacterColorInfo) => c.character_name === character_name);

        if (character == undefined) {
            return;
        }

        active_character.set(new CharacterColorInfo(character));

    });

}