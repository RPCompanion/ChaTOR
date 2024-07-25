
import { type IRequirements } from "./common";

export interface IWeaponProficiency {
    categories: IWeaponCategory[];
}

export interface IWeaponCategory {
    category: string;
    weapons: IWeapon[];
}

export interface IWeapon {
    weapon: string;
    required?: IRequirements;
}