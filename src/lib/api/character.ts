import type { ICharacterSheet } from "../character_sheet/character_sheet";
import { Result, Ok, Err } from "../result";
import { session_token, get_session_token } from './account';
import { get } from "svelte/store";
import { API_ENDPOINTS } from "../api";
import type { ICharacter } from "../network/characters";

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

interface IUpdateCharacterRequest {
    session_token: string;
    sheet: ICharacterSheet;
    public_id: string;
    template_id: number;
    server_id: number;
}

/**
 * Creates a new character on the server.
*/
export async function create_character(character: ICreateCharacter): Promise<Result<ICreateCharacterResponse, string>> {

    let t_session_token = get_session_token();
    if (t_session_token.is_err()) {
        return t_session_token.transform_ok();
    }

    let payload: ICreateCharacterRequest = {
        ...character,
        session_token: t_session_token.unwrap()
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

export async function update_character(character: ICharacter): Promise<Result<[], string>> {

    let t_session_token = get_session_token();
    if (t_session_token.is_err()) {
        return t_session_token.transform_ok();
    }

    let payload: IUpdateCharacterRequest = {
        session_token: t_session_token.unwrap(),
        sheet: character.character_sheet,
        public_id: character.public_id,
        template_id: character.template_id,
        server_id: character.server_id
    };

    let request = new Request(API_ENDPOINTS.character.update.url, {
        method: API_ENDPOINTS.character.update.type,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    try {

        let response = await fetch(request);

        if (response.ok) {
            return Ok([]);
        } else {
            return Err(await response.text());
        }

    } catch (e) {
        return Err("Failed to update character.");
    }


}