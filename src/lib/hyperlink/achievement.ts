
import { type Option, None, Some } from "../option";
import { type HyperLinkBase } from "./base";

export interface IHyperLinkAchievement {
    type: "achievement";
    id: bigint;
    character: string;
    completed: false | Date;
    objectives: bigint[];
    remainder?: string;
}

export class HyperLinkAchievement implements HyperLinkBase {

    public readonly type: "achievement";
    public readonly id: bigint;
    public readonly character: string;
    public readonly completed: false | Date;
    public readonly objectives: bigint[];
    public readonly remainder?: string;

    public constructor(data: IHyperLinkAchievement) {
        this.type = data.type;
        this.id = data.id;
        this.character = data.character;
        this.completed = data.completed;
        this.objectives = data.objectives;
        this.remainder = data.remainder;
    }

    public as_string(): Option<string> {
        return None();
    }

}