
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { IPerk } from "../../../lib/character_template/perk";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";

    export let perk: IPerk;
    export let perks: string[] | undefined = [];

    const dispatch = createEventDispatcher();

    let perk_selected: boolean = false;
    $: perk_selected = perks!.includes(perk.name);

    function add_perk(perk: IPerk) {
        dispatch("add_perk", perk);
    }

    function remove_perk(perk: IPerk) {
        dispatch("remove_perk", perk);
    }

</script>

<div 
    class="w-96 min-h-32 px-2 rounded-md relative" 
    class:bg-slate-600={!perk_selected} 
    class:bg-slate-500={perk_selected}
>
    <p class="text-xl text-white underline">{perk.name}</p>
    <p class="text-white">{perk.description}</p>
    <div class="absolute bottom-1">
        {#if perk_selected}
            <VariableSizeButton on:click={() => { remove_perk(perk); }}>Remove</VariableSizeButton>
        {:else}
            <VariableSizeButton on:click={() => { add_perk(perk); }}>Add</VariableSizeButton>
        {/if}
    </div>
</div>