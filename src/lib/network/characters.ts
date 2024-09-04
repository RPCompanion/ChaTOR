
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "../result";
import type { ICharacterSheet } from "../character_sheet/character_sheet";

export interface ICharacter {
    character_sheet: ICharacterSheet;
    public_id: string;
    template_id: number;
    server_id: number;
}

/**
 * gets all characters that are stored locally.
*/
export async function get_all_characters(): Promise<Result<ICharacter[], string>> {

    try {
        return Ok(await invoke("get_all_characters") as ICharacter[]);
    } catch (e) {
        return Err(e as string);
    }

}

/**
 * Saves a character to the local database.
*/
export async function save_character(character: ICharacter): Promise<Result<[], string>> {

    try {
        await invoke("save_character", { character });
        return Ok([]);
    } catch (e) {
        return Err(e as string);
    }

}