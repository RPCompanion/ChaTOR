
import { type HyperLinkBase } from "./base";

export interface IHyperLinkQuest {
    type: "quest";
    id: bigint;
    const1: bigint;
    quest_step: bigint;
    remainder?: string;
}

export class HyperLinkQuest implements HyperLinkBase {

    public readonly type: "quest";
    public readonly id: bigint;
    public readonly const1: bigint;
    public readonly quest_step: bigint;
    public readonly remainder?: string;

    public constructor(data: IHyperLinkQuest) {
        this.type = data.type;
        this.id = data.id;
        this.const1 = data.const1;
        this.quest_step = data.quest_step;
        this.remainder = data.remainder;
    }

    public as_string(): string {
        throw new Error("Method not implemented.");
    }

}