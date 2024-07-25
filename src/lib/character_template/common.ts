
export interface IAttributeModifier {
    name: string;
    modifier: number;
}

export interface ISkillModifier {
    name: string;
    modifier: number;
}

export interface IAttributeRequirement {
    name: string;
    greater_than_or_equal_to: number;
}

export interface ISkillRequirement {
    name: string;
    greater_than_or_equal_to: number;
}

export interface IRequirements {
    perks?: string[];
    attributes?: IAttributeRequirement[];
    skills?: ISkillRequirement[];
}