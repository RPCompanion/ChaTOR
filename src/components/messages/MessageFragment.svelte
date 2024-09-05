
<script lang="ts">

    import { Color } from "../../lib/network/local_characters";
    import { settings } from "../../lib/network/settings";
    import type { Hyperlink } from "../../lib/hyperlink_parser";
    import { unicode_unescape } from "../../lib/utils";
    import { ESwtorChannel } from "../../lib/network/swtor_channel";
    import { HyperLinkGuild } from "../../lib/hyperlink/guild";
    import { HyperLinkItem } from "../../lib/hyperlink/item";
    import { HyperLinkQuest } from "../../lib/hyperlink/quest";
    import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";
    import ExternalFragment from "./ExternalFragment.svelte";

    import QuestFragment from "./QuestFragment.svelte";

    export let fragment: string | Hyperlink
    export let channel_type: ESwtorChannel;

    let color_hex: string = get_channel_color(channel_type);
    $: color_hex = get_channel_color(channel_type);

    function get_channel_color(channel_type: ESwtorChannel): string {

        let channel_colors = $settings.chat_log.window.channel_colors;
        switch (channel_type) {

            case ESwtorChannel.SAY:         return Color.get_hex(channel_colors.say);
            case ESwtorChannel.YELL:        return Color.get_hex(channel_colors.yell);
            case ESwtorChannel.EMOTE:       return Color.get_hex(channel_colors.emote);
            case ESwtorChannel.WHISPER:     return Color.get_hex(channel_colors.whisper);
            case ESwtorChannel.GROUP:       return Color.get_hex(channel_colors.group);
            case ESwtorChannel.GUILD:       return Color.get_hex(channel_colors.guild);
            case ESwtorChannel.OP:          return Color.get_hex(channel_colors.ops);
            case ESwtorChannel.OPS_OFFICER: return Color.get_hex(channel_colors.ops_leader);
            default: return new Color(channel_colors.say).to_hex();

        }

    }

</script>

{#if typeof fragment == "string"}
    <span class="break-words" style="color: {color_hex}">{unicode_unescape(fragment)}</span>
{:else}

    {#if fragment instanceof HyperLinkGuild}
        <span class="break-words text-yellow-300">{fragment.as_string().unwrap()}</span>
    {:else if fragment instanceof HyperLinkItem}
        <ExternalFragment fragment={fragment} />
    {:else if fragment instanceof HyperLinkQuest}
        <QuestFragment fragment={fragment} />
    {:else if fragment instanceof HyperLinkAchievement}
        <ExternalFragment fragment={fragment} />
    {:else}
        <span class="break-words" style="color: {color_hex}">{"<Unknown>"}</span>
    {/if}

{/if}