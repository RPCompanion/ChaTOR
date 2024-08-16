
import { API_ENDPOINTS } from "../api";
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

    let request = new Request(API_ENDPOINTS.character.template.url.replace("{template_id}", template_id.toString()), {
        method: API_ENDPOINTS.character.template.type
    });

    try {

        let response = await fetch(request);
        if (!response.ok) {
            return Err(await response.text());
        }

        return Ok(new CharacterTemplate(await response.json()));

    } catch (e) {
        return Err("Failed to fetch template");
    }

}

/** 
 * Fetches all character templates from the server.
*/
export async function fetch_templates(): Promise<Result<IMinifiedCharacterTemplate[], string>> {

    let request = new Request(API_ENDPOINTS.character.templates.url, {
        method: API_ENDPOINTS.character.templates.type
    });

    try {

        let response = await fetch(request);
        if (!response.ok) {
            return Err(await response.text());
        }

        return Ok(await response.json());

    } catch (e) {
        return Err("Failed to fetch templates");
    }

}