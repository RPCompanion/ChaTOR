
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../lib/character_sheet/character_sheet";
    import type { CharacterTemplate } from "../../lib/character_template/character_template";
    import type { IPerk } from "../../lib/character_template/perk";
    import Perk from "./_Perk.svelte";
    import PerkMeta from "./_PerkMeta.svelte";

    export let template: CharacterTemplate;
    export let sheet: ICharacterSheet;
    
    const perks: IPerk[] = template.perks!;
    const dispatch = createEventDispatcher();

    const MAX_PERKS: number | undefined = template.allotments.perks!.max_perks;
    let active_perk_meta: IPerk | undefined = undefined;

    let leftover_pointers: number = get_leftover_points(sheet.perks);
    $: leftover_pointers = get_leftover_points(sheet.perks);

    function add_perk(t_perk: CustomEvent<IPerk>) {

        let perk = t_perk.detail;

        if (sheet.perks!.includes(perk.name)) {
            return;
        }

        if (leftover_pointers - perk.point_cost < 0) {
            return;
        }

        if (MAX_PERKS != undefined && sheet.perks!.length >= MAX_PERKS) {
            return;
        }

        sheet.perks!.push(perk.name);
        sheet = sheet;

    }

    function remove_perk(t_perk: CustomEvent<IPerk>) {

        let perk = t_perk.detail;

        if (!sheet.perks!.includes(perk.name)) {
            return;
        }

        sheet.perks = sheet.perks!.filter((p) => p !== perk.name);
        sheet = sheet;

    }

    function show_perk_meta(t_perk: CustomEvent<IPerk>) {
        active_perk_meta = t_perk.detail;
    }

    function on_next() {
        dispatch("next");
    }

    function on_back() {
        dispatch("back");
    }

    function get_leftover_points(perks: string[] | undefined): number {

        let points: number = template.allotments.perks!.given_points;

        for (let perk of perks!) {
            points -= template.perks!.find((p) => p.name === perk)!.point_cost;
        }

        return points;

    }

</script>

<div class="flex flex-col gap-2">
    <div class="text-xl text-white flex flex-row gap-1">
        Perks points left: 
        <p class="bg-slate-500 px-2 rounded-md shadow-md">{leftover_pointers}</p>
    </div>
    {#if MAX_PERKS != undefined && sheet.perks != undefined}
        <div class="text-xl text-white flex flex-row gap-1 select-none">
            Perks left to choose: 
            <p class="bg-slate-500 px-2 rounded-md shadow-md select-none">{MAX_PERKS - sheet.perks.length}</p>
        </div>
    {/if}
    <div class="flex flex-col gap-2">
        {#each perks as perk}
            <Perk 
                {perk} 
                bind:perks={sheet.perks} 
                on:add_perk={add_perk} 
                on:remove_perk={remove_perk} 
                on:show_perk_meta={show_perk_meta}
            />
        {/each}
    </div>
    <div class="flex flex-row gap-2 justify-center">
        <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
        <VariableSizeButton on:click={on_next}>Next</VariableSizeButton>
    </div>
</div>