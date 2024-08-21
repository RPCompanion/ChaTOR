
<script lang="ts">
    import { fade } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import type { IPerk } from "../../../lib/character_template/perk";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import PerkMeta from "./_PerkMeta.svelte";

    export let perk: IPerk;
    export let perks: string[] | undefined = [];

    let show_perk_meta: boolean = false;

    const dispatch = createEventDispatcher();

    let perk_selected: boolean = false;
    $: perk_selected = perks!.includes(perk.name);

    function add_perk(perk: IPerk) {
        dispatch("add_perk", perk);
    }

    function remove_perk(perk: IPerk) {
        dispatch("remove_perk", perk);
    }

    function show_dialog() {
        show_perk_meta = true;
    }

    function hide_dialog() {
        show_perk_meta = false;
    }

</script>

<div
    role="region"
    aria-label="perk selection"
    class="w-96 min-h-36 px-2 rounded-md relative cursor-pointer" 
    class:bg-slate-600={!perk_selected} 
    class:bg-slate-500={perk_selected}
    on:mouseenter={show_dialog}
    on:mouseleave={hide_dialog}
>

    {#if show_perk_meta}
        <div 
            class="absolute -right-56 bg-slate-600 rounded-b-md rounded-t-sm border-1 border-slate-900 w-52"
            transition:fade={{duration: 200}}>
                <div class="triangle-left absolute -left-2"></div>
                <PerkMeta {perk} />
        </div>
    {/if}
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
</div>

<style>
    .triangle-left {
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-right: 10px solid #475569;
    }
</style>