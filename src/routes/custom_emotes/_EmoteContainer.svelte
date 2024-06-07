
<script lang="ts">
    import type { ICustomEmote } from "../../lib/network/custom_emote";
    import Emote from "./_Emote.svelte";

    export let emotes: ICustomEmote[];
    export let favourite: boolean;

    let items = get_relevant_items(emotes);
    $: items  = get_relevant_items(emotes);


    function get_relevant_items(emotes: ICustomEmote[]): ICustomEmote[] {

        return emotes
            .filter((e) => e.favourite == favourite)
            .sort((a, b) => a.order_index - b.order_index);

    }

</script>

<section class="flex flex-col gap-2">
    {#each items as emote}
        <Emote {emote} {favourite}/>
    {/each}
</section>

