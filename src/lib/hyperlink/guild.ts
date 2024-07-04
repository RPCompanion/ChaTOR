
import { type Option, None, Some } from "../option";
import { type HyperLinkBase } from "./base";

export interface IHyperLinkGuild {
    type: "guild";
    id: bigint;
    name: string;
    remainder?: string;
}

export class HyperLinkGuild implements HyperLinkBase {

    public readonly type: "guild";
    public readonly id: bigint;
    public readonly name: string;
    public readonly remainder?: string;

    public constructor(data: IHyperLinkGuild) {
        this.type = data.type;
        this.id = data.id;
        this.name = data.name;
        this.remainder = data.remainder;
    }

    public as_string(): Option<string> {
        return Some(`<${this.name}>`);
    }

}