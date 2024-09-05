import { type Option, None, Some } from "../option";
import type { ChannelDispatcher } from "./settings";

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
    CUSTOM_CHANNEL = 60
}

export class SwtorChannel {

    public readonly type: ESwtorChannel;

    constructor(channel: ESwtorChannel) {

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
            case ESwtorChannel.PVP: return Some("/2");
            case ESwtorChannel.TRADE: return Some("/3");
            case ESwtorChannel.GROUP: return Some("/p");
            case ESwtorChannel.GUILD: return Some("/g");
            case ESwtorChannel.GUILD_OFFICER: return Some("/o");
            case ESwtorChannel.OP: return Some("/ops");
            case ESwtorChannel.OPS_OFFICER: return Some("/oo");
            case ESwtorChannel.OPS_ANNOUNCEMENT: return Some("/oa");
            default: return None();
        }

    }

}

export function get_all_channel_ids(): number[] {

    return Object.keys(ESwtorChannel)
        .filter((key) => !isNaN(Number(key)))
        .map((key) => Number(key));

}

export function get_all_channel_dispatch(): ChannelDispatcher[] {

    return get_all_channel_ids()
        .map((id) => { return { RegularDispatch: id } });

}

export function get_all_channel_names(): string[] {

    return get_all_channel_ids()
        .map((id) => new SwtorChannel(id).get_name())
        .filter((name) => name.is_some())
        .map((name) => name.unwrap());

}