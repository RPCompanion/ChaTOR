
<script lang="ts">

    import type { ICharacterSheet } from "../lib/character_sheet/character_sheet";
    import { servers } from "../lib/api/system";
    import { CaretDown } from "phosphor-svelte";

    export let sheet: ICharacterSheet;
    export let server_id: number;

    let server_name = $servers.find(s => s.server_id == server_id)!.name;

</script>

<div class="flex flex-col items-center">

    <p class="text-white text-2xl"><b>{sheet.name}</b></p>
    <p class="text-white text-xl underline">{server_name}</p>
    {#if sheet.description != null}
        <p class="text-white text-xl">{sheet.description}</p>
    {/if}

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

    <div class="h-6"></div>
    <div class="flex flex-col gap-1 select-none">
        {#each sheet.attributes as attribute}
            <details>

                <summary class="grid grid-cols-2 text-white text-2xl bg-slate-700 rounded-md p-1" class:cursor-pointer={attribute.skills != undefined}>
                    <p class="flex flex-row">
                        {attribute.name}
                        {#if attribute.skills != undefined}
                            <CaretDown class="text-white" size=22 />
                        {/if}
                    </p>
                    <div class="flex flex-row-reverse pr-2">
                        <p>{attribute.value}</p>
                    </div>
                </summary>

                {#if attribute.skills != undefined}
                    <div class="pl-4 flex flex-col gap-1">
                        <div></div>
                        {#each attribute.skills as skill}
                            <div class="grid grid-cols-2 text-white text-xl bg-slate-600 rounded-md pb-1">
                                <p>{skill.name}:</p>
                                <p class="flex flex-row-reverse pr-2">{skill.value}</p>
                            </div>
                        {/each}
                    </div>
                {/if}

            </details>
        {/each}
    </div>

</div>