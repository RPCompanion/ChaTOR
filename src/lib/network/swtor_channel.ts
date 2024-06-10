import { type Option, None, Some } from "../option";

export enum ESwtorChannel {
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

export class SwtorChannel {

    public readonly type: ESwtorChannel;
    constructor(channel: number) {
        this.type = channel;
    }

    public get_name(): Option<string> {

        switch (this.type) {
            case ESwtorChannel.SAY:     return Some("say");
            case ESwtorChannel.YELL:    return Some("yell");
            case ESwtorChannel.EMOTE:   return Some("emote");
            case ESwtorChannel.WHISPER: return Some("whisper");
            case ESwtorChannel.GLOBAL:  return Some("global");
            case ESwtorChannel.PVP:     return Some("pvp");
            case ESwtorChannel.TRADE:   return Some("trade");
            case ESwtorChannel.GROUP:   return Some("group");
            case ESwtorChannel.GUILD:   return Some("guild");
            default:                   return None();
        }

    }

    public get_command(): Option<string> {

        switch (this.type) {
            case ESwtorChannel.SAY: return Some("/s");
            case ESwtorChannel.YELL: return Some("/y");
            case ESwtorChannel.EMOTE: return Some("/e");
            case ESwtorChannel.WHISPER: return Some("/w");
            case ESwtorChannel.GLOBAL: return Some("/1");
            case ESwtorChannel.PVP: return Some("/pvp");
            case ESwtorChannel.TRADE: return Some("/trade");
            case ESwtorChannel.GROUP: return Some("/group");
            case ESwtorChannel.GUILD: return Some("/g");
            default: return None();
        }

    }

}

export function get_all_channel_ids(): number[] {

    return Object.keys(ESwtorChannel)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => Number(key));

}