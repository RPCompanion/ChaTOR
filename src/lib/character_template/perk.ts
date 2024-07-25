
import { type IAttributeModifier, type ISkillModifier } from "./common";

export interface IPerk {
  name: string;
  description: string;
  point_cost: number;
  attributes?: IAttributeModifier[];
  skills?: ISkillModifier[];
}