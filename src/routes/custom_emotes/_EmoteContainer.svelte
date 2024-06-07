
<script lang="ts">
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import { update_custom_emotes_batch, type ICustomEmote } from "../../lib/network/custom_emote";
    import Emote from "./_Emote.svelte";

    export let emotes: ICustomEmote[];
    export let favourite: boolean;

    let items: DNDItem[] = get_relevant_items(emotes);
    $: items  = get_relevant_items(emotes);

    interface DNDItem extends ICustomEmote {
        id: number;
    }

    function get_relevant_items(emotes: ICustomEmote[]): DNDItem[] {

        return emotes
            .filter((e) => e.favourite == favourite)
            .sort((a, b) => a.order_index - b.order_index)
            .map((emote, index) => ({ ...emote, id: index }));

    }

    function on_consider(e: CustomEvent<DndEvent<DNDItem>>) {

        items = e.detail.items;

    }

    function on_finalize(e: CustomEvent<DndEvent<DNDItem>>) {

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

