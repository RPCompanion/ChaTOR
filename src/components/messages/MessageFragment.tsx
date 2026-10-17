import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { Color } from "../../lib/network/local_characters";
import type { ISettings } from "../../lib/network/settings";
import type { Hyperlink } from "../../lib/hyperlink_parser";
import { unicode_unescape } from "../../lib/utils";
import { ESwtorChannel } from "../../lib/network/swtor_channel";
import { HyperLinkGuild } from "../../lib/hyperlink/guild";
import { HyperLinkItem } from "../../lib/hyperlink/item";
import { HyperLinkQuest } from "../../lib/hyperlink/quest";
import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";
import ExternalFragment from "./ExternalFragment";
import QuestFragment from "./QuestFragment";

interface MessageFragmentProps {
    fragment: string | Hyperlink;
    channel_type: ESwtorChannel;
}

function get_channel_color(settings: ISettings, channel_type: ESwtorChannel): string {
    const cc = settings.chat_log.window.channel_colors;
    switch (channel_type) {
        case ESwtorChannel.GLOBAL:      return Color.get_hex(cc.global);
        case ESwtorChannel.PVP:         return Color.get_hex(cc.pvp);
        case ESwtorChannel.TRADE:       return Color.get_hex(cc.trade);
        case ESwtorChannel.SAY:         return Color.get_hex(cc.say);
        case ESwtorChannel.YELL:        return Color.get_hex(cc.yell);
        case ESwtorChannel.EMOTE:       return Color.get_hex(cc.emote);
        case ESwtorChannel.WHISPER:     return Color.get_hex(cc.whisper);
        case ESwtorChannel.GROUP:       return Color.get_hex(cc.group);
        case ESwtorChannel.GUILD:       return Color.get_hex(cc.guild);
        case ESwtorChannel.OP:          return Color.get_hex(cc.ops);
        case ESwtorChannel.OPS_OFFICER: return Color.get_hex(cc.ops_leader);
        default:                        return new Color(cc.say).to_hex();
    }
}

export default function MessageFragment({ fragment, channel_type }: MessageFragmentProps) {
    const settings = useAppStore((s) => s.settings);
    const color_hex = get_channel_color(settings, channel_type);

    if (typeof fragment === "string") {
        return <span className="wrap-break-word" style={{ color: color_hex }}>{unicode_unescape(fragment)}</span>;
    }

    if (fragment instanceof HyperLinkGuild) {
        return <span className="wrap-break-word text-yellow-300">{fragment.as_string().unwrap()}</span>;
    }
    if (fragment instanceof HyperLinkItem) {
        return <ExternalFragment fragment={fragment} />;
    }
    if (fragment instanceof HyperLinkQuest) {
        return <QuestFragment fragment={fragment} />;
    }
    if (fragment instanceof HyperLinkAchievement) {
        return <ExternalFragment fragment={fragment} />;
    }
    return <span className="wrap-break-word" style={{ color: color_hex }}>{"<Unknown>"}</span>;
}
