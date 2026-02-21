import type { ICharacterSheet } from "../character_sheet/character_sheet";
import { Result, Ok, Err } from "../result";
import { useAccountStore } from "../../store/useAccountStore";
import { API_ENDPOINTS } from "../api";

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

export async function create_character(character: ICreateCharacter): Promise<Result<ICreateCharacterResponse, string>> {
    const t_session_token = useAccountStore.getState().sessionToken;
    if (t_session_token === null) {
        return Err("You are not logged in. Consider restarting the application.");
    }

    const payload: ICreateCharacterRequest = {
        ...character,
        session_token: t_session_token,
    };

    const request = new Request(API_ENDPOINTS.character.create.url, {
        method: API_ENDPOINTS.character.create.type,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    try {
        const response = await fetch(request);
        if (response.ok) {
            return Ok(await response.json());
        } else {
            return Err(await response.text());
        }
    } catch (e) {
        return Err("Failed to create character.");
    }
}
