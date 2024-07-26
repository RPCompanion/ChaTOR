
<script lang="ts">

    import PageFormatting from "../../../components/_PageFormatting.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import { CharacterTemplate } from "../../../lib/character_template/character_template";
    import standard from './standard';
    import JSON5 from 'json5';

    import Name from "./_Name.svelte";
    
    enum SheetComponents {
        Name,
        Perks,
        WeaponProficiencies,
        Attributes,
        Save
    }
    let sheet_component: SheetComponents = SheetComponents.Name;

    const template = new CharacterTemplate(JSON5.parse(standard));
    let sheet: ICharacterSheet = template.get_base_character_sheet();

    function template_has_perks() {
        return template.perks != undefined && template.perks.length > 0;
    }

    function template_has_weapon_proficiencies() {
        return template.weapon_proficiencies != undefined && template.weapon_proficiencies.categories.length > 0;
    }

    function on_next() {

        switch (sheet_component) {

            case SheetComponents.Name:

                if (template_has_perks()) {
                    sheet_component = SheetComponents.Perks;
                } else if (template_has_weapon_proficiencies()) {
                    sheet_component = SheetComponents.WeaponProficiencies;
                } else {
                    sheet_component = SheetComponents.Attributes;
                }
                break;

            case SheetComponents.Perks:

                if (template_has_weapon_proficiencies()) {
                    sheet_component = SheetComponents.WeaponProficiencies;
                } else {
                    sheet_component = SheetComponents.Attributes;
                }
                break;

            case SheetComponents.WeaponProficiencies:

                sheet_component = SheetComponents.Attributes;
                break;

            case SheetComponents.Attributes:

                sheet_component = SheetComponents.Save;
                break;

        }

    }

    function on_back() {

        switch (sheet_component) {

            case SheetComponents.Perks:

                sheet_component = SheetComponents.Name;
                break;

            case SheetComponents.WeaponProficiencies:

                if (template_has_perks()) {
                    sheet_component = SheetComponents.Perks;
                } else {
                    sheet_component = SheetComponents.Name;
                }
                break;

            case SheetComponents.Attributes:

                if (template_has_weapon_proficiencies()) {
                    sheet_component = SheetComponents.WeaponProficiencies;
                } else {
                    sheet_component = SheetComponents.Name;
                }
                break;

            case SheetComponents.Save:

                sheet_component = SheetComponents.Attributes;
                break;

        }

    }

</script>

<PageFormatting title="Create Character Sheet">
    <div class="h-6"></div>
    <Name {sheet} on:next={on_next}/>
</PageFormatting>