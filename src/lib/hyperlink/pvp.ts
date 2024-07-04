
import { type HyperLinkBase } from "./base";

export interface IHyperLinkPVP {
    type: "pvp";
    char_name: string;
    char_id: bigint;
    discipline: bigint;
    queue: string;
    remainder?: string;
}

export class HyperLinkPVP implements HyperLinkBase {

    public readonly type: "pvp";
    public readonly char_name: string;
    public readonly char_id: bigint;
    public readonly discipline: bigint;
    public readonly queue: string;
    public readonly remainder?: string;

    public constructor(data: IHyperLinkPVP) {
        this.type = data.type;
        this.char_name = data.char_name;
        this.char_id = data.char_id;
        this.discipline = data.discipline;
        this.queue = data.queue;
        this.remainder = data.remainder;
    }

    public as_string(): string {
        throw new Error("Method not implemented.");
    }

}