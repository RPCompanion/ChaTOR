
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
    OPS_ANNOUNCEMENT = 58,
    GUILD = 57,
    GUILD_OFFICER = 58,
}

export class Channel {

    public readonly type: SwtorChannel;
    constructor(channel: number) {
        this.type = channel;
    }

}