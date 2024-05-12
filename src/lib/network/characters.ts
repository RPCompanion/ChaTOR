
import { invoke } from "@tauri-apps/api";

export interface Color {
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
        callback(response as ICharacter[]);
    })

}