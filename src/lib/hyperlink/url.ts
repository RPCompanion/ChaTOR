
import { type HyperLinkBase } from "./base";

export interface IHyperLinkURL {
    type: "url";
    index: bigint;
    remainder?: string;
}

export class HyperLinkURL implements HyperLinkBase {

    public readonly type: "url";
    public readonly index: bigint;
    public readonly remainder?: string;

    public constructor(data: IHyperLinkURL) {
        this.type = data.type;
        this.index = data.index;
        this.remainder = data.remainder;
    }

    public as_string(): string {
        throw new Error("Method not implemented.");
    }

}