import type { ICharacterSheet } from "../character_sheet/character_sheet";
import { Result, Ok, Err } from "../result";
import { session_token } from "./account";
import { get } from "svelte/store";
import { API_ENDPOINTS } from "../api";

import { invoke } from "@tauri-apps/api";
import { toast_error } from "../utils";

export interface ICharacter {
    character_sheet: ICharacterSheet;
    public_id: string;
}

export interface ICreateCharacterResponse {
    public_id: string;
}

export interface ICreateCharacter {
    server_id: number;
    template_id: number;
    sheet: ICharacterSheet;
}

interface ICreateCharacterRequest extends ICreateCharacter {
    session_token: string;
}

/**
 * Creates a new character on the server.
*/
export async function create_character(character: ICreateCharacter): Promise<Result<ICreateCharacterResponse, string>> {

    let t_session_token = get(session_token);
    if (t_session_token === null) {
        return Err("You are not logged in. Consider restarting the application.");
    }

    let payload: ICreateCharacterRequest = {
        ...character,
        session_token: t_session_token
    }

    let request = new Request(API_ENDPOINTS.character.create.url, {
        method: API_ENDPOINTS.character.create.type,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    try {

        let response = await fetch(request);

        if (response.ok) {
            return Ok(await response.json());
        } else {
            return Err(await response.text());
        }

    } catch (e) {
        return Err("Failed to create character.");
    }

}

/**
 * Saves a character to the local database.
*/
export async function save_character_locally(character: ICharacter): Promise<Result<[], string>> {

    try {
        await invoke("save_character", { character });
        return Ok([]);
    } catch (e) {
        return Err(e as string);
    }

}