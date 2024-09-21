
<script lang="ts">

    import { goto } from "@roxi/routify";
    import CharacterCreator from "../../../components/character_creator/_CharacterCreator.svelte";
    import type { ICharacterSubmission } from "../../../components/character_creator/character_creator";
    import { character } from "./character_sheets_update";
    import { toast_error } from "../../../lib/utils";
    import { CharacterTemplate } from "../../../lib/character_template/character_template";
    import { fetch_template } from "../../../lib/api/template";
    import { toast } from "@zerodevx/svelte-toast";

    if ($character == undefined) {

        toast_error("Something went wrong with setting the character to update.");
        $goto("/character_sheets");

    } else {

        init();

    }

    let ready_to_show_creator: boolean = false;
    let template: CharacterTemplate | undefined = undefined;

    function reset_character_sheet() {

        let new_sheet = template!.get_base_character_sheet();

        new_sheet.name = $character!.character_sheet.name;
        new_sheet.template = $character!.character_sheet.template;

        $character!.character_sheet = new_sheet;

    }

    async function init() {

        let response = await fetch_template($character!.template_id);
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }

        template = response.unwrap();
        if (!template!.same_template($character!.character_sheet.template)) {

            toast.push("The template for this character has been updated. Resetting character sheet");
            reset_character_sheet();

        }

        ready_to_show_creator = true;

    }

    function on_submit(event: CustomEvent<ICharacterSubmission>) {

        console.log("STUB: Character update submission");

    }

</script>

{#if $character != undefined && template != undefined && ready_to_show_creator}

    <CharacterCreator
        bind:sheet={$character.character_sheet}
        bind:template_id={$character.template_id}
        bind:server_id={$character.server_id}
        bind:template={template}
        template_has_perks={template.has_perks()}
        template_has_weapon_proficiencies={template.has_weapon_proficiencies()}
        on:submit={on_submit}/>

{/if}