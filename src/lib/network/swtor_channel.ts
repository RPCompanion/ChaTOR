import { type Option, None, Some } from "../option";

export enum SwtorChannel {
    SAY = 1,
    YELL = 2,
    EMOTE = 3,
    WHISPER = 4,
    GLOBAL = 51,
    PVP = 52,
    TRADE = 53,
    GROUP = 54,
    OP    = 55,
    OPS_OFFICER = 61,
    OPS_ANNOUNCEMENT = 56,
    GUILD = 57,
    GUILD_OFFICER = 58,
}

export class Channel {

    public readonly type: SwtorChannel;
    constructor(channel: number) {
        this.type = channel;
    }

    public get_name(): Option<string> {

        switch (this.type) {
            case SwtorChannel.SAY:     return Some("say");
            case SwtorChannel.YELL:    return Some("yell");
            case SwtorChannel.EMOTE:   return Some("emote");
            case SwtorChannel.WHISPER: return Some("whisper");
            case SwtorChannel.GLOBAL:  return Some("global");
            case SwtorChannel.PVP:     return Some("pvp");
            case SwtorChannel.TRADE:   return Some("trade");
            case SwtorChannel.GROUP:   return Some("group");
            case SwtorChannel.GUILD:   return Some("guild");
            default:                   return None();
        }

    }

}

export function get_all_channel_ids(): number[] {

    return Object.keys(SwtorChannel)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => Number(key));

}