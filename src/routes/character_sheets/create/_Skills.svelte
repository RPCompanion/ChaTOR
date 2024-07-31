
<script lang="ts">
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { IAttribute, ISkill } from "../../../lib/character_template/attributes";
    import PmButton from "./_PMButton.svelte";

    export let attribute: IAttribute;
    export let sheet: ICharacterSheet;    
    export let l_skill_points: number | undefined;
    export let MAX_SKILL_VALUE: number | undefined;

    let skills: ISkill[] | undefined = attribute.skills;

    function on_skill_change(skill_name: string, value: number) {

        if (l_skill_points != undefined && value > 0 && l_skill_points == 0) {
            return;
        }

        let attr  = sheet.attributes.find((attr) => attr.name == attribute.name)!;
        let skill = attr.skills?.find((skill) => skill.name == skill_name);

        if (skill == undefined) {
            return;
        }

        let temp = skill.value + value;
        if (temp < 0 || (MAX_SKILL_VALUE != undefined && temp > MAX_SKILL_VALUE)) {
            return;
        }

        skill.value = temp;
        sheet = sheet;

    }

    function get_skill_value(sheet: ICharacterSheet, skill_name: string): number {

        return sheet.attributes.find((attr) => attr.name == attribute.name)!
            .skills?.find((skill) => skill.name == skill_name)?.value ?? 0;

    }

</script>

{#if skills != undefined}
    <div class="flex flex-col gap-1 pl-4">
        {#each skills as skill}
            <div class="grid grid-cols-2 bg-slate-600 rounded-md pb-1">
                <div class="text-2xl text-white pl-2">{skill.name}</div>
                <div class="flex flex-col-reverse gap-1">
                    <div class="flex flex-row-reverse gap-1 pr-1">
                        <PmButton on:click={() => { on_skill_change(skill.name, -1); }}>-</PmButton>
                        <p class="bg-white rounded-md w-12 text-center text-xl">{get_skill_value(sheet, skill.name)}</p>
                        <PmButton on:click={() => { on_skill_change(skill.name, 1); } } >+</PmButton>
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}