import type { ICharacterSheet } from "../../lib/character_sheet/character_sheet";

/**
 * Interface for the character submission object. This object is used when the player has pressed submit on the character.
*/
export interface ICharacterSubmission {
    sheet: ICharacterSheet;
    server_id: number;
    template_id: number;
}