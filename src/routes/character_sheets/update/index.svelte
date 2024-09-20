
<script lang="ts">

    import { goto } from "@roxi/routify";
    import CharacterCreator from "../../../components/character_creator/_CharacterCreator.svelte";
    import type { ICharacterSubmission } from "../../../components/character_creator/character_creator";
    import { character } from "./character_sheets_update";
    import { toast_error } from "../../../lib/utils";
    import { CharacterTemplate } from "../../../lib/character_template/character_template";
    import { fetch_template } from "../../../lib/api/template";

    if ($character == undefined) {

        toast_error("Something went wrong with setting the character to update.");
        $goto("/character_sheets");

    } else {

        init();

    }

    let template: CharacterTemplate | undefined = undefined;

    async function init() {

        let response = await fetch_template($character!.template_id);
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }

        template = response.unwrap();

    }

    function on_submit(event: CustomEvent<ICharacterSubmission>) {

        console.log("STUB: Character update submission");

    }

</script>

{#if $character != undefined && template != undefined}

    <CharacterCreator
        bind:sheet={$character.character_sheet}
        bind:template_id={$character.template_id}
        bind:server_id={$character.server_id}
        bind:template={template}
        on:submit={on_submit}/>

{/if}