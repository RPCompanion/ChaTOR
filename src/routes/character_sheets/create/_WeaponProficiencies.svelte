
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { IWeaponProficiency } from "../../../lib/character_template/weapon_proficiency";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { CharacterTemplate } from "../../../lib/character_template/character_template";
    import Checkbox from "../../../lib/Checkbox.svelte";
    
    export let template: CharacterTemplate;
    export let sheet: ICharacterSheet;

    let weapon_prociencies: IWeaponProficiency = template.weapon_proficiencies!;
    let proficiencies: boolean[][] = weapon_prociencies
        .categories
        .map(category => {

            return category.weapons.map(weapon => {
                return sheet.weapon_proficiencies.includes(weapon.weapon);
            });

        });

    const dispatch = createEventDispatcher();

    function on_next() {
        dispatch("next");
    }

    function on_back() {
        dispatch("back");
    }

    function on_checked(checked: boolean, weapon: string) {
        
        if (checked) {
            sheet.weapon_proficiencies.push(weapon);
        } else {
            sheet.weapon_proficiencies = sheet.weapon_proficiencies.filter(w => w != weapon);
        }

    }
</script>

<div class="flex flex-col gap-2">
    {#each weapon_prociencies.categories as category, idx}
        <div class="relative">
            <h2 class="text-white text-2xl">{category.category}</h2>
            <div class="ml-6 flex flex-row gap-2">
                {#each category.weapons as weapon, jdx}
                    <Checkbox checked={proficiencies[idx][jdx]} on:checked={(event) => { on_checked(event.detail, weapon.weapon) }}>{weapon.weapon}</Checkbox>
                {/each}
            </div>
        </div>
    {/each}
</div>

<div class="h-6"></div>
<VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
<VariableSizeButton on:click={on_next}>Next</VariableSizeButton>