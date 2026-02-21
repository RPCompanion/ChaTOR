import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../store/useAppStore";
import { ESwtorChannel } from "./swtor_channel";
import { Result, Ok, Err } from "../result";

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export class Color implements IColor {
    public r: number;
    public g: number;
    public b: number;

    constructor(color: IColor) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
    }

    public equals(other: Color): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b;
    }

    public to_hex(): string {
        return Color.get_hex(this);
    }

    public static get_hex(color: IColor): string {
        return "#" + color.r.toString(16).padStart(2, '0') + color.g.toString(16).padStart(2, '0') + color.b.toString(16).padStart(2, '0');
    }
}

export class LocalCharacterInfo implements ICharacterColorInfo {
    public character_name: string;
    public channel_colors?: Color[];

    constructor(character: ICharacterColorInfo) {
        this.character_name = character.character_name;
        this.channel_colors = character.channel_colors;
    }

    public get_channel_color(channel: ESwtorChannel): Color | undefined {
        if (this.channel_colors === undefined) {
            return undefined;
        }
        switch (channel) {
            case ESwtorChannel.SAY:          return this.channel_colors[SAY_COLOR_INDEX];
            case ESwtorChannel.YELL:         return this.channel_colors[YELL_COLOR_INDEX];
            case ESwtorChannel.EMOTE:        return this.channel_colors[EMOTE_COLOR_INDEX];
            case ESwtorChannel.WHISPER:      return this.channel_colors[WHISPER_COLOR_INDEX];
            case ESwtorChannel.GUILD:        return this.channel_colors[GUILD_COLOR_INDEX];
            case ESwtorChannel.GUILD_OFFICER: return this.channel_colors[GUILD_COLOR_INDEX];
            case ESwtorChannel.GROUP:        return this.channel_colors[GROUP_COLOR_INDEX];
            case ESwtorChannel.OP:           return this.channel_colors[OPS_COLOR_INDEX];
            case ESwtorChannel.OPS_OFFICER:  return this.channel_colors[OPS_LEADER_COLOR_INDEX];
            default:                         return this.channel_colors[SAY_COLOR_INDEX];
        }
    }
}

export interface ICharacterColorInfo {
    character_name: string;
    channel_colors?: Color[];
}

export const OPS_LEADER_COLOR_INDEX: number = 29;
export const OPS_COLOR_INDEX: number     = 12;
export const GUILD_COLOR_INDEX: number   = 10;
export const GROUP_COLOR_INDEX: number   = 9;
export const WHISPER_COLOR_INDEX: number = 3;
export const EMOTE_COLOR_INDEX: number   = 2;
export const YELL_COLOR_INDEX: number    = 1;
export const SAY_COLOR_INDEX: number     = 0;

export function get_all_local_characters(callback: (characters: Result<ICharacterColorInfo[], string>) => void) {
    type LocalCharacterResponseElem = {
        character_name: string,
        channel_colors?: IColor[]
    }

    invoke("get_all_local_characters").then((response: any) => {
        const temp: ICharacterColorInfo[] = response.map((c: LocalCharacterResponseElem) => ({
            character_name: c.character_name,
            channel_colors: c.channel_colors?.map((cc: IColor) => new Color(cc))
        }));
        callback(Ok(temp));
    }).catch((error: string) => {
        callback(Err(error));
    });
}

export function init_active_local_character() {
    get_all_local_characters((characters: Result<ICharacterColorInfo[], string>) => {
        if (characters.is_err()) {
            return;
        }
        const character_name = useAppStore.getState().settings.chat_log.character_ini_to_pull_from;
        if (character_name === undefined || character_name === null) {
            return;
        }
        const character = characters.unwrap().find((c: ICharacterColorInfo) => c.character_name === character_name);
        if (character === undefined) {
            return;
        }
        useAppStore.getState().setActiveCharacter(new LocalCharacterInfo(character));
    });
}
