

<script lang="ts">

    import PageFormatting from "../../components/_PageFormatting.svelte";
    import type { ICharacterSheet } from "../../lib/character_sheet/character_sheet";
    import { CharacterTemplate } from "../../lib/character_template/character_template";

    import Template from "./_Template.svelte";
    import Name from "./_Name.svelte";
    import Attributes from "./_Attributes.svelte";
    import Perks from "./_Perks.svelte";
    import WeaponProficiencies from "./_WeaponProficiencies.svelte";
    import Save from "./_Save.svelte";
    import type { ICharacterSubmission } from "./character_creator";
    import { createEventDispatcher } from "svelte";
    
    enum SheetComponents {
        Name,
        Perks,
        WeaponProficiencies,
        Attributes,
        Save
    }
    let sheet_component: SheetComponents = SheetComponents.Name;

    const dispatch = createEventDispatcher();

    export let template: CharacterTemplate | undefined = undefined;
    export let sheet: ICharacterSheet | undefined = undefined;

    export let template_has_perks: boolean = false;
    export let template_has_weapon_proficiencies: boolean = false;

    export let server_id: number   = 0;
    export let template_id: number = 0;

    interface ISelectedTemplate {
        template_id: number;
        template: CharacterTemplate;
    }

    function on_selected_template(event: CustomEvent<ISelectedTemplate>) {

        template_id = event.detail.template_id;
        template = event.detail.template;

        template_has_perks = template.has_perks();
        template_has_weapon_proficiencies = template.has_weapon_proficiencies();
        
        sheet = template.get_base_character_sheet();

    }

    function on_next() {

        switch (sheet_component) {

            case SheetComponents.Name:

                if (template_has_perks) {
                    sheet_component = SheetComponents.Perks;
                } else if (template_has_weapon_proficiencies) {
                    sheet_component = SheetComponents.WeaponProficiencies;
                } else {
                    sheet_component = SheetComponents.Attributes;
                }
                break;

            case SheetComponents.Perks:

                if (template_has_weapon_proficiencies) {
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

                if (template_has_perks) {
                    sheet_component = SheetComponents.Perks;
                } else {
                    sheet_component = SheetComponents.Name;
                }
                break;

            case SheetComponents.Attributes:

                if (template_has_weapon_proficiencies) {
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

    function get_page_title(l_sheet_comp: SheetComponents): string {
            
        switch (l_sheet_comp) {

            case SheetComponents.Name:
                return "Name and Description";
            case SheetComponents.Perks:
                return "Perks";
            case SheetComponents.WeaponProficiencies:
                return "Weapon Proficiencies";
            case SheetComponents.Attributes:
                return "Attributes";
            case SheetComponents.Save:
                return "Save";

        }

    }

    function on_submit(event: CustomEvent<ICharacterSubmission>) {
        dispatch("submit", event.detail);
    }

</script>

<PageFormatting title={template == undefined ? 'Templates' : get_page_title(sheet_component)}>

    <div class="h-6"></div>
    {#if template == undefined}

        <Template on:selected_template={on_selected_template}/>

    {:else if sheet != undefined}

        {#if sheet_component == SheetComponents.Name}
            <Name {template} bind:sheet bind:server_id on:next={on_next}/>
        {:else if sheet_component == SheetComponents.Perks}
            <Perks {template} bind:sheet on:back={on_back} on:next={on_next}/>
        {:else if sheet_component == SheetComponents.WeaponProficiencies}
            <WeaponProficiencies {template} bind:sheet on:back={on_back} on:next={on_next}/>
        {:else if sheet_component == SheetComponents.Attributes}
            <Attributes {template} bind:sheet on:back={on_back} on:next={on_next}/>
        {:else if sheet_component == SheetComponents.Save}
            <Save bind:sheet bind:server_id bind:template_id on:back={on_back} on:submit={on_submit}/>
        {/if}

    {/if}

</PageFormatting>