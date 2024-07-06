
import { type Option, None, Some } from "../option";
import { type HyperLinkBase } from "./base";
import { get_name_by_global_id } from "../game_data";

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

    public name?: string;

    public constructor(data: IHyperLinkQuest) {
        this.type = data.type;
        this.id = data.id;
        this.const1 = data.const1;
        this.quest_step = data.quest_step;
        this.remainder = data.remainder;
        this.set_name();
    }

    private set_name() {

        get_name_by_global_id(this.id).then((result) => {

            if (result.is_ok()) {
                this.name = result.unwrap();
            }
            
        });

    }

    public as_string(): Option<string> {
        return None();
    }

}