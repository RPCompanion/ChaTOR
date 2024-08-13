
import { type IAttributeModifier, type ISkillModifier } from "./common";

export interface IPerk {
  name: string;
  description: string;
  point_cost: number;
  attributes?: IAttributeModifier[];
  skills?: ISkillModifier[];
  base_health_modifier?: number;
  base_armor_class_modifier?: number;
}