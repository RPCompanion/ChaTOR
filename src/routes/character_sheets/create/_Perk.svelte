
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { IPerk } from "../../../lib/character_template/perk";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import PerkMeta from "./_PerkMeta.svelte";

    export let perk: IPerk;
    export let perks: string[] | undefined = [];

    let dialog: HTMLDivElement | null = null;

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
        dialog!.hidden = false;
    }

    function hide_dialog() {
        dialog!.hidden = true;
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
    <div bind:this={dialog} hidden class="absolute -right-56 bg-slate-600 rounded-md border-2 border-slate-900 w-52">
        <PerkMeta {perk} />
    </div>
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