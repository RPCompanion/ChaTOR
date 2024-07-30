
<script lang="ts">
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { IAttribute, ISkill } from "../../../lib/character_template/attributes";
    import PmButton from "./_PMButton.svelte";

    export let attribute: IAttribute;
    export let sheet: ICharacterSheet;    

    let skills: ISkill[] | undefined = attribute.skills;

    function on_skill_change(skill_name: string, value: number) {

    }

    function get_skill_value(sheet: ICharacterSheet, name: string): number {
        return 0;
    }

</script>

{#if skills != undefined}
    <div class="flex flex-col gap-1 pl-4">
        {#each skills as skill}
            <div class="grid grid-cols-2 bg-slate-600 rounded-md pb-1">
                <div class="text-2xl text-white pl-2">{skill.name}</div>
                <div class="flex flex-col-reverse gap-1">
                    <div class="flex flex-row-reverse gap-1">
                        <PmButton on:click={() => { on_skill_change(attribute.name, -1); }}>-</PmButton>
                        <p class="bg-white rounded-md w-12 text-center text-xl">{get_skill_value(sheet, attribute.name)}</p>
                        <PmButton on:click={() => { on_skill_change(attribute.name, 1); } } >+</PmButton>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}