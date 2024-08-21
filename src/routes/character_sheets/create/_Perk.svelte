
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { IPerk } from "../../../lib/character_template/perk";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";

    export let perk: IPerk;
    export let perks: string[] | undefined = [];
    export let perk_meta_being_shown: boolean = false;

    const dispatch = createEventDispatcher();

    let perk_selected: boolean = false;
    $: perk_selected = perks!.includes(perk.name);

    function add_perk(perk: IPerk) {
        dispatch("add_perk", perk);
    }

    function remove_perk(perk: IPerk) {
        dispatch("remove_perk", perk);
    }

    function show_perk_meta(perk: IPerk) {
        dispatch("show_perk_meta", perk);
    }

</script>

<button 
    class="min-h-36 px-2 rounded-md relative " 
    class:bg-slate-600={!perk_selected} 
    class:bg-slate-500={perk_selected}
    on:click={() => { show_perk_meta(perk); }}
>
    <p class="text-xl text-white underline">{perk.name}</p>
    <p class="text-white">{perk.description}</p>
    <p class:text-green-400={perk.point_cost > 0} class:text-red-300={perk.point_cost < 0}>point cost: {perk.point_cost}</p>
    <div class="absolute bottom-1 right-1">
        {#if perk_selected}
            <VariableSizeButton on:click={() => { remove_perk(perk); }}>Remove</VariableSizeButton>
        {:else}
            <VariableSizeButton on:click={() => { add_perk(perk); }}>Add</VariableSizeButton>
        {/if}
    </div>
</button>