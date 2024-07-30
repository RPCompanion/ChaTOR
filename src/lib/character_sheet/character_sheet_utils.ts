import type { CharacterTemplate } from "../character_template/character_template";
import type { ICharacterSheet } from "./character_sheet";

export class CharacterSheetUtils {

    private sheet: ICharacterSheet;
    private readonly template: CharacterTemplate;

    constructor(sheet: ICharacterSheet, template: CharacterTemplate) {
        this.sheet = sheet;
        this.template = template;
    }

    public update_sheet(sheet: ICharacterSheet): void { 
        this.sheet = sheet;
    }

    public can_use_attribute(attribute_name: string): boolean {
        return true;
    }

}