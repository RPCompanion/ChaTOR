
import { Result, Ok, Err } from "../result";

export interface ITemplate {
    name: string;
    version: [number, number, number];
}

export interface ISheetSkill {
    name: string;
    value: number;
}

export interface ISheetAttribute {
    name: string;
    value: number;
    skills?: ISheetSkill[];
}

export interface ICharacterSheet {
    name: string;
    template: ITemplate;
    description?: string;
    health: number;
    armor_class: number;
    weapon_proficiencies: string[];
    perks?: string[];
    attributes: ISheetAttribute[];
}