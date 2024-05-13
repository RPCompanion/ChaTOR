
import { invoke } from "@tauri-apps/api";

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

}

interface IColor {
    r: number;
    g: number;
    b: number;
}

export interface ICharacter {
    character_name: string;
    channel_colors: Color[];
}

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