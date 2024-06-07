
<script lang="ts">

    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import { custom_emotes } from "../../lib/network/custom_emote";
    import CustomEmoteElem from "./_CustomEmoteElem.svelte";
    import { 
        get_relevant_emotes_from_list, 
        reorder_emotes_and_update, 
        type IDNDCustomEmote 
    } from "../../lib/custom_emote_utils";

    let items: IDNDCustomEmote[] = get_relevant_emotes_from_list($custom_emotes, true);
    $: items = get_relevant_emotes_from_list($custom_emotes, true);

    function on_consider(e: CustomEvent<DndEvent<IDNDCustomEmote>>) {

        items = e.detail.items;

    }

    function on_finalize(e: CustomEvent<DndEvent<IDNDCustomEmote>>) {

        items = e.detail.items;
        reorder_emotes_and_update(items);

    }

</script>

{#if items.length > 0}
    <div class="bg-gray-500 text-white text-xl text-center border-t-2 border-b-2 border-slate-500">Favourite Emotes</div>
    <div class="flex flex-row flex-wrap gap-2 max-h-56 overflow-y-auto" use:dndzone="{{items}}" on:consider={on_consider} on:finalize={on_finalize}>
        {#each items as emote(emote.id)}
            <CustomEmoteElem {emote} favourite={true}/>
        {/each}
    </div>
{/if}

