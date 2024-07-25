import { type IRequirements } from "./common";

export interface ISkill {
    name: string;
    description: string;
}

export interface IAttribute {
    name: string;
    description: string;
    skills: ISkill[];
    required?: IRequirements;
}
