
<script lang="ts">

    import { active_character } from "../../lib/network/characters";
    import type { Hyperlink } from "../../lib/hyperlink_parser";
    import { unicode_unescape } from "../../lib/utils";
    import type { ESwtorChannel } from "../../lib/network/swtor_channel";

    export let fragment: string | Hyperlink
    export let channel_type: ESwtorChannel;

</script>

{#if typeof fragment == "string"}
    <span class="break-words " style="color: {$active_character?.get_channel_color(channel_type).to_hex()}">{unicode_unescape(fragment)}</span>
{:else}
    {#if fragment.as_string().is_some()}
        <span class="break-words " style="color: {$active_character?.get_channel_color(channel_type).to_hex()}">{fragment.as_string().unwrap()}</span>
    {:else}
        <span class="break-words " style="color: {$active_character?.get_channel_color(channel_type).to_hex()}">{"<Unknown>"}</span>
    {/if}
{/if}