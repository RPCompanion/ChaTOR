
import { invoke } from "@tauri-apps/api";
import { writable, get } from "svelte/store";
import { settings } from "./settings";
import { ChannelType } from "./swtor_channel";

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

export class Character {
    
    public character_name: string;
    public channel_colors: Color[];

    constructor(character: ICharacter) {
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

    public get_channel_color(channel: ChannelType): Color {

        switch (channel) {
            case ChannelType.SAY: return this.channel_colors[SAY_COLOR_INDEX];
            case ChannelType.YELL: return this.channel_colors[YELL_COLOR_INDEX];
            case ChannelType.EMOTE: return this.channel_colors[EMOTE_COLOR_INDEX];
            case ChannelType.WHISPER: return this.channel_colors[WHISPER_COLOR_INDEX];
            default: return this.channel_colors[SAY_COLOR_INDEX];
        }

    }

    
}

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export interface ICharacter {
    character_name: string;
    channel_colors: Color[];
}

export const WHISPER_COLOR_INDEX: number = 3;
export const EMOTE_COLOR_INDEX: number   = 2;
export const YELL_COLOR_INDEX: number    = 1;
export const SAY_COLOR_INDEX: number     = 0;

export const active_character = writable<Character | undefined>(undefined);

export function get_all_characters(callback: (characters: ICharacter[]) => void) {

    invoke("get_all_characters").then((response: any) => {

        let temp: ICharacter[] = response.map((c: any) => {
            return {
                character_name: c.character_name,
                channel_colors: c.channel_colors.map((cc: IColor) => new Color(cc.r, cc.g, cc.b))
            }
        });
        callback(temp);

    })

}

export function init_active_character() {

    get_all_characters((characters: ICharacter[]) => {

        let character_name = get(settings).chat_log.character_ini_to_pull_from;

        if (character_name == undefined) {
            return;
        }

        let character = characters.find((c: ICharacter) => c.character_name === character_name);
        if (character == undefined) {
            return;
        }

        active_character.set(new Character(character));

    });

}