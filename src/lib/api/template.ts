
import { invoke } from "@tauri-apps/api/core";
import { api_error_message } from "../api";
import { CharacterTemplate } from "../character_template/character_template";
import { type Result, Ok, Err } from "../result";

export interface IMinifiedCharacterTemplate {
    template_id: number;
    name: string;
    description: string;
    version: [number, number, number];
}

/**
 * Fetches a character template from the server.
*/
export async function fetch_template(template_id: number): Promise<Result<CharacterTemplate, string>> {

    try {
        return Ok(new CharacterTemplate(await invoke("get_character_template", { templateId: template_id })));
    } catch (e) {
        return Err(api_error_message(e));
    }

}

/**
 * Fetches all character templates from the server.
*/
export async function fetch_templates(): Promise<Result<IMinifiedCharacterTemplate[], string>> {

    try {
        return Ok(await invoke<IMinifiedCharacterTemplate[]>("get_character_templates"));
    } catch (e) {
        return Err(api_error_message(e));
    }

}
