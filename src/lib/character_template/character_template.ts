
import { type ICharacterSheet, type ISheetAttribute } from "../character_sheet/character_sheet";
import { type IAttribute } from "./attributes";
import type { IRequirements } from "./common";
import { type IPerk } from "./perk";
import { type IWeaponProficiency } from "./weapon_proficiency";
import { CharacterTemplate as ChatorCharacterTemplate } from "@chator/character-sheet";

export interface ICharacterTemplate {
    name: string;
    version: [number, number, number];
    description: string;
    base_health: number;
    base_armor_class: number;
    allotments: IAllotment;
    perks?: IPerk[];
    weapon_proficiencies?: IWeaponProficiency;
    attributes: IAttribute[];
}

export interface IPoints {
    given_points: number;
    max_points_per_allotment?: number;
}

export interface IPerkPoints {
    given_points: number;
    max_perks?: number;
}

export interface IAllotment {
    attributes: IPoints;
    skills?: IPoints;
    perks?: IPerkPoints;
}

export class CharacterTemplate implements ICharacterTemplate {

    public readonly name: string;
    public readonly version: [number, number, number];
    public readonly description: string;
    public readonly base_health: number;
    public readonly base_armor_class: number;
    public readonly allotments: IAllotment;
    public readonly perks?: IPerk[];
    public readonly weapon_proficiencies?: IWeaponProficiency;
    public readonly attributes: IAttribute[];

    constructor(readonly template: ICharacterTemplate) {

        this.name = template.name;
        this.version = template.version;
        this.description = template.description;
        this.base_health = template.base_health;
        this.base_armor_class = template.base_armor_class;
        this.allotments = template.allotments;
        this.perks = template.perks;
        this.weapon_proficiencies = template.weapon_proficiencies;
        this.attributes = template.attributes;

    }

    public same_template(template: ICharacterTemplate): boolean {

        return this.name === template.name &&
               this.version[0] === template.version[0] &&
               this.version[1] === template.version[1] &&
               this.version[2] === template.version[2];

    }

    public get_base_character_sheet(): ICharacterSheet {

        let char_template = ChatorCharacterTemplate.from_str(JSON.stringify(this));
        return JSON.parse(char_template.get_base_character_sheet().as_json_str())

    }

    public has_perks(): boolean {
        return this.perks !== undefined && this.perks.length > 0;
    }

    public has_weapon_proficiencies(): boolean {
        return this.weapon_proficiencies !== undefined && this.weapon_proficiencies.categories.length > 0;
    }

    public get_attribute_requirements(attribute_name: string): IRequirements | undefined {

        let attribute = this.attributes.find((attribute) => {
            return attribute.name === attribute_name;
        });

        if (attribute) {
            return attribute.required;
        }

        return undefined;

    }

}