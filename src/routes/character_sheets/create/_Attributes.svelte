
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { CharacterTemplate } from "../../../lib/character_template/character_template";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import { CharacterSheetUtils } from "../../../lib/character_sheet/character_sheet_utils";
    import type { IAttribute } from "../../../lib/character_template/attributes";
    import PmButton from "./_PMButton.svelte";
    import Skills from "./_Skills.svelte";
    import { CaretDown } from "phosphor-svelte";
    
    export let template: CharacterTemplate;
    export let sheet: ICharacterSheet;

    let attributes: IAttribute[] = template.attributes;

    const GIVEN_ATTRIBUTE_POINTS: number          = template.allotments.attributes.given_points;
    const MAX_ATTRIBUTE_VALUE: number | undefined = template.allotments.attributes.max_points_per_allotment;
    const GIVEN_SKILL_POINTS: number | undefined  = template.allotments.skills?.given_points;
    const MAX_SKILL_VALUE: number | undefined     = template.allotments.skills?.max_points_per_allotment;

    let char_sheet_utils: CharacterSheetUtils = new CharacterSheetUtils(sheet, template);
    let l_attribute_points: number         = get_leftover_attribute_points(sheet);
    let l_skill_points: number | undefined = get_leftover_skill_points(sheet);

    $: l_attribute_points = get_leftover_attribute_points(sheet);
    $: l_skill_points     = get_leftover_skill_points(sheet);
    $: char_sheet_utils.update_sheet(sheet);

    const dispatch = createEventDispatcher();

    function clean_up_sheet() {

        sheet.attributes.forEach((attr) => {

            if (char_sheet_utils.can_use_attribute(attr.name)) {
                return;
            }

            attr.value = 0;

            if (attr.skills == undefined) {
                return;
            }

            attr.skills.forEach((skill) => {

                if (skill.value == 0) {
                    return;
                }

                skill.value = 0;

            });

        });

    }

    function get_leftover_attribute_points(t_sheet: ICharacterSheet): number {

        return GIVEN_ATTRIBUTE_POINTS - t_sheet.attributes.reduce((acc, attribute) => {

            if (char_sheet_utils.can_use_attribute(attribute.name)) {
                return acc + attribute.value;
            }
            return acc;

        }, 0);

    }

    function get_leftover_skill_points(t_sheet: ICharacterSheet): number | undefined {

        if (GIVEN_SKILL_POINTS == undefined) {
            return undefined;
        }

        return GIVEN_SKILL_POINTS - t_sheet.attributes.reduce((acc, attribute) => { 
            return acc + (attribute.skills == undefined ? 0 : attribute.skills!.reduce((acc2, skill) => acc2 + skill.value, 0))
        }, 0);

    }

    function on_next() {
        dispatch("next");
    }

    function on_back() {
        dispatch("back");
    }

    function on_attr_change(attribute: string, value: number) {

        if (l_attribute_points == 0 && value > 0) {
            return;
        }

        let attr = sheet.attributes.find((a) => a.name === attribute);
        if (attr == undefined) {
            return;
        }

        let temp = attr.value + value;
        if (temp < 0) {
            return;
        }

        if (MAX_ATTRIBUTE_VALUE != undefined && temp > MAX_ATTRIBUTE_VALUE) {
            return;
        }

        attr.value = temp;
        sheet = sheet;

    }

    function get_attribute_value(t_sheet: ICharacterSheet, attribute: string): number {

        let attr = t_sheet.attributes.find((a) => a.name === attribute);

        if (attr == undefined) {
            return 0;
        }

        return attr.value;

    }

    clean_up_sheet();

</script>

<div class="flex flex-col gap-1">

    <div class="text-white text-xl select-none flex flex-row gap-1">
        <p>Attribute points left:</p>
        <p class="bg-slate-500 rounded-md px-2">{l_attribute_points}</p>
    </div>

    {#if l_skill_points != undefined}
        <div class="text-white text-xl select-none flex flex-row gap-1">
            <p>Skill points left:</p>
            <p class="bg-slate-500 rounded-md px-2">{l_skill_points}</p>
        </div>
    {/if}

    {#each attributes as attribute}
        {#if char_sheet_utils.can_use_attribute(attribute.name)}

            <details>

                <summary class="bg-slate-700 rounded-md p-1 grid grid-cols-2" class:cursor-pointer={attribute.skills}>
                    <div class="text-white select-none flex flex-row gap-1">
                        <h2 class="text-2xl">{attribute.name}</h2>
                        {#if attribute.skills != undefined}
                            <CaretDown class="text-white" size=22 />
                        {/if}
                    </div>
                    <div class="flex flex-row-reverse gap-1">
                        <PmButton on:click={() => { on_attr_change(attribute.name, -1); }}>-</PmButton>
                        <p class="bg-white rounded-md w-12 text-center text-xl select-none">{get_attribute_value(sheet, attribute.name)}</p>
                        <PmButton on:click={() => { on_attr_change(attribute.name, 1); } } >+</PmButton>
                    </div>
                </summary>

                {#if attribute.skills != undefined}
                    <div class="h-1"></div>
                    <Skills {MAX_SKILL_VALUE} {l_skill_points} {attribute} bind:sheet />
                {/if}

            </details> 

        {/if}
    {/each}

</div>

<div class="h-6"></div>
<VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
<VariableSizeButton on:click={on_next}>Next</VariableSizeButton>