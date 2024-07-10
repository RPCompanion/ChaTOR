
<script lang="ts">

    import { active_character } from "../../lib/network/characters";
    import type { Hyperlink } from "../../lib/hyperlink_parser";
    import { unicode_unescape } from "../../lib/utils";
    import type { ESwtorChannel } from "../../lib/network/swtor_channel";
    import { HyperLinkGuild } from "../../lib/hyperlink/guild";
    import { HyperLinkItem } from "../../lib/hyperlink/item";
    import { HyperLinkQuest } from "../../lib/hyperlink/quest";
    import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";

    import ItemFragment from "./ItemFragment.svelte";
    import QuestFragment from "./QuestFragment.svelte";
    import AchievementFragment from "./AchievementFragment.svelte";

    export let fragment: string | Hyperlink
    export let channel_type: ESwtorChannel;

    let color_hex: string = "#000000";
    $: color_hex = $active_character?.get_channel_color(channel_type).to_hex() ?? "#000000";

</script>

{#if typeof fragment == "string"}
    <span class="break-words" style="color: {color_hex}">{unicode_unescape(fragment)}</span>
{:else}

    {#if fragment instanceof HyperLinkGuild}
        <span class="break-words text-yellow-300">{fragment.as_string().unwrap()}</span>
    {:else if fragment instanceof HyperLinkItem}
        <ItemFragment fragment={fragment} />
    {:else if fragment instanceof HyperLinkQuest}
        <QuestFragment fragment={fragment} />
    {:else if fragment instanceof HyperLinkAchievement}
        <AchievementFragment fragment={fragment} />
    {:else}
        <span class="break-words" style="color: {color_hex}">{"<Unknown>"}</span>
    {/if}

{/if}