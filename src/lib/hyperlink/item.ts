
import { type Option, None, Some } from "../option";
import { type HyperLinkBase } from "./base";
import { get_name_by_global_id } from "../game_data";

export interface ItemCraftable {
    schematic: bigint;
    modifier?: bigint;
    unknown?: bigint;
}

export interface ItemMod {
    id: bigint;
    modifier: bigint;
    unknown: bigint;
}

export interface IHyperLinkItem {
    type: "item";
    id: bigint;
    augmented: bigint;
    const_false?: true;
    craftable?: ItemCraftable;
    modifier?: bigint;
    mods: ItemMod[];
    final33: bigint;
    remainder?: string;
}

export class HyperLinkItem implements HyperLinkBase {

    public readonly type: "item";
    public readonly id: bigint;
    public readonly augmented: bigint;
    public readonly const_false?: true;
    public readonly craftable?: ItemCraftable;
    public readonly modifier?: bigint;
    public readonly mods: ItemMod[];
    public readonly final33: bigint;
    public readonly remainder?: string;

    public name?: string;

    public constructor(data: IHyperLinkItem) {
        this.type = data.type;
        this.id = data.id;
        this.augmented = data.augmented;
        this.const_false = data.const_false;
        this.craftable = data.craftable;
        this.modifier = data.modifier;
        this.mods = data.mods;
        this.final33 = data.final33;
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