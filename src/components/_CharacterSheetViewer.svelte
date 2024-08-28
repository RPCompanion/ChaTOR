
<script lang="ts">

    import type { ICharacterSheet } from "../lib/character_sheet/character_sheet";
    import { servers } from "../lib/api/system";

    export let sheet: ICharacterSheet;
    export let server_id: number;

    let server_name = $servers.find(s => s.server_id == server_id)!.name;

</script>

<div class="flex flex-col items-center">

    <p class="text-white text-2xl"><b>{sheet.name}</b></p>
    <p class="text-white text-xl underline">{server_name}</p>
    <p class="text-white text-xl">{sheet.description}</p>

    {#if sheet.perks != undefined}
        <div class="h-6"></div>
        <p class="text-white text-2xl underline">Perks</p>
        {#if sheet.perks.length > 0}
            <div class="h-6"></div>
        {/if}
        <div class="flex flex-row gap-2">
            {#each sheet.perks as perk}
                <p class="text-white bg-slate-500 rounded-md px-2">{perk}</p>
            {/each}
        </div>
    {/if}
    
    {#if sheet.weapon_proficiencies.length > 0}
        <div class="h-6"></div>
        <p class="text-white text-2xl underline">Weapon Proficiencies</p>
        {#if sheet.weapon_proficiencies.length > 0}
            <div class="h-6"></div>
        {/if}
        <div class="flex flex-row gap-2">
            {#each sheet.weapon_proficiencies as wp}
                <p class="text-white bg-slate-500 rounded-md px-2">{wp}</p>
            {/each}
        </div>
    {/if}

</div>