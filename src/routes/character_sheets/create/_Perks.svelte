
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { CharacterTemplate } from "../../../lib/character_template/character_template";
    import type { IPerk } from "../../../lib/character_template/perk";

    export let template: CharacterTemplate;
    export let sheet: ICharacterSheet;
    
    const perks: IPerk[] = template.perks!;
    const dispatch = createEventDispatcher();

    let leftover_pointers: number = get_leftover_points(sheet.perks);
    $: leftover_pointers = get_leftover_points(sheet.perks);

    function add_perk(perk: IPerk) {

        if (sheet.perks!.includes(perk.name)) {
            return;
        }

        if (leftover_pointers - perk.point_cost < 0) {
            return;
        }

        sheet.perks!.push(perk.name);
        sheet = sheet;

    }

    function remove_perk(perk: IPerk) {

        if (!sheet.perks!.includes(perk.name)) {
            return;
        }

        sheet.perks = sheet.perks!.filter((p) => p !== perk.name);
        sheet = sheet;

    }

    function on_next() {
        dispatch("next");
    }

    function on_back() {
        dispatch("back");
    }

    function has_perk(perk: string, perks: string[] | undefined): boolean {
        return perks!.includes(perk);
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
    <p class="text-xl text-white">Points: {leftover_pointers}</p>
    <div class="flex flex-col items-center gap-2">
        {#each perks as perk}
            <div 
                class="w-96 min-h-32 px-2 rounded-md relative" 
                class:bg-slate-600={!has_perk(perk.name, sheet.perks)} 
                class:bg-slate-500={has_perk(perk.name, sheet.perks)}
            >
                <p class="text-xl text-white underline">{perk.name}</p>
                <p class="text-white">{perk.description}</p>
                <div class="absolute bottom-1">
                    {#if has_perk(perk.name, sheet.perks)}
                        <VariableSizeButton on:click={() => { remove_perk(perk); }}>Remove</VariableSizeButton>
                    {:else}
                        <VariableSizeButton on:click={() => { add_perk(perk); }}>Add</VariableSizeButton>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
    <div class="flex flex-row gap-2 justify-center">
        <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
        <VariableSizeButton on:click={on_next}>Next</VariableSizeButton>
    </div>
</div>