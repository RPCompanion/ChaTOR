
<script lang="ts">
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import { update_custom_emotes_batch, type ICustomEmote } from "../../lib/network/custom_emote";
    import Emote from "./_Emote.svelte";
    import { get_relevant_emotes_from_list, type IDNDCustomEmote } from "../../lib/custom_emote_utils";

    export let emotes: ICustomEmote[];
    export let favourite: boolean;

    let items: IDNDCustomEmote[] = get_relevant_emotes_from_list(emotes, favourite);
    $: items = get_relevant_emotes_from_list(emotes, favourite);

    function on_consider(e: CustomEvent<DndEvent<IDNDCustomEmote>>) {

        items = e.detail.items;

    }

    function on_finalize(e: CustomEvent<DndEvent<IDNDCustomEmote>>) {

        items = e.detail.items;
        items.forEach((emote, index) => {
            emote.order_index = index;
        });
        update_custom_emotes_batch(items);

    }

</script>

<section class="flex flex-col gap-2" use:dndzone="{{items}}" on:consider={on_consider} on:finalize={on_finalize}>
    {#each items as emote(emote.id)}
        <Emote {emote} {favourite}/>
    {/each}
</section>

