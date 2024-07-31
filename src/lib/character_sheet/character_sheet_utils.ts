import type { CharacterTemplate } from "../character_template/character_template";
import type { IAttributeRequirement, ISkillRequirement } from "../character_template/common";
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
        
        let requirements = this.template.get_attribute_requirements(attribute_name);
        if (requirements == undefined) {
            return true;
        }

        return this.has_perks(requirements.perks) && this.has_correct_attribute_points(requirements.attributes) && this.has_correct_skill_points(requirements.skills);

    }

    private has_perks(perks: string[] | undefined): boolean {

        if (perks == undefined) {
            return true;
        }

        for (let perk of perks) {

            if (!this.sheet.perks!.includes(perk)) {
                return false;
            }

        }

        return true;

    }

    private has_correct_attribute_points(attributes: IAttributeRequirement[] | undefined): boolean {

        if (attributes == undefined) {
            return true;
        }

        for (let attribute of attributes) {

            let sheet_attribute = this.sheet.attributes.find((attr) => attr.name === attribute.name);
            if (sheet_attribute == undefined || sheet_attribute.value < attribute.greater_than_or_equal_to) {
                return false;
            }

        }

        return true;

    }

    private has_correct_skill_points(skills: ISkillRequirement[] | undefined): boolean {

        if (skills == undefined) {
            return true;
        }

        for (let skill of skills) {

            let sheet_skill = this.sheet.attributes.find((attr) => {

                if (attr.skills == undefined) {
                    return false;
                }
                return attr.skills.find((skill) => skill.name === skill.name);

            })

            if (sheet_skill == undefined || sheet_skill.value < skill.greater_than_or_equal_to) {
                return false;
            }

        }

        return true;

    }

}