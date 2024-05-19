
export enum ChannelType {
    SAY = 1,
    YELL = 2,
    EMOTE = 3,
    WHISPER = 4,
    GLOBAL = 51,
    GROUP = 54,
    GUILD = 57
}

export class Channel {

    public readonly type: ChannelType;
    constructor(channel: number) {
        this.type = channel;
    }

}