
<script lang="ts">

    import { active_character } from "../lib/network/characters";
    import type { SwtorMessage } from "../lib/network/swtor_message";
    import { unicode_unescape } from "../lib/utils";
    export let message: SwtorMessage;

</script>

{#each message.message_fragments as fragment}

    {#if typeof fragment == "string"}
        <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{unicode_unescape(fragment)}</span>
    {:else}
        {#if fragment.as_string().is_some()}
            <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{fragment.as_string().unwrap()}</span>
        {:else}
            <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{"<Unknown>"}</span>
        {/if}
    {/if}

{/each}