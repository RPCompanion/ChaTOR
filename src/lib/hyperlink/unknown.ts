
import { type HyperLinkBase } from "./base";

export interface IHyperLinkUnknown {
    type: "unknown";
    remainder?: string;
}

export class HyperLinkUnknown implements HyperLinkBase {

    public readonly type: "unknown";
    public readonly remainder?: string;

    public constructor(data: IHyperLinkUnknown) {
        this.type = data.type;
        this.remainder = data.remainder;
    }

    public as_string(): string {
        throw new Error("Method not implemented.");
    }

}