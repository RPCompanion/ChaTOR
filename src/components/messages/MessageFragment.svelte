
<script lang="ts">

    import { active_character } from "../../lib/network/characters";
    import type { Hyperlink } from "../../lib/hyperlink_parser";
    import { unicode_unescape } from "../../lib/utils";
    import type { ESwtorChannel } from "../../lib/network/swtor_channel";
    import { HyperLinkGuild } from "../../lib/hyperlink/guild";
    import { HyperLinkItem } from "../../lib/hyperlink/item";
    import { HyperLinkQuest } from "../../lib/hyperlink/quest";

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
        {#if fragment.name != undefined}
            <span class="break-words text-yellow-300">{ "{" + fragment.name + "}" }</span>
        {:else}
            <span class="break-words text-yellow-300">{"<Loading>"}</span>
        {/if}
    {:else if fragment instanceof HyperLinkQuest}
        {#if fragment.name != undefined}
            <span class="break-words text-yellow-300">{ "{" + fragment.name + "}" }</span>
        {:else}
            <span class="break-words text-yellow-300">{"<Loading>"}</span>
        {/if}
    {:else}
        <span class="break-words" style="color: {color_hex}">{"<Unknown>"}</span>
    {/if}

{/if}