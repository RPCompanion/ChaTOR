
<script lang="ts">
    
    import { goto } from "@roxi/routify";
    import CharacterCreator from "../../../components/character_creator/_CharacterCreator.svelte";
    import { toast_error } from "../../../lib/utils";
    import { Result, Ok, Err } from "../../../lib/result";
    import { save_character, type ICharacter } from "../../../lib/network/characters";
    import { type ICreateCharacter, create_character } from "../../../lib/api/character";
    import { type ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { ICharacterSubmission } from "../../../components/character_creator/character_creator";

    let sheet: ICharacterSheet;
    let server_id: number;
    let template_id: number;

    async function submit_to_server(): Promise<Result<ICharacter, []>> {

        const c_char: ICreateCharacter = {
            server_id: server_id,
            template_id: template_id,
            sheet: sheet
        };

        let response = await create_character(c_char);
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return Err([]);
        }

        return Ok({
            public_id: response.unwrap().public_id,
            character_sheet: sheet,
            server_id: server_id,
            template_id: template_id
        })

    }

    async function submit_to_local(character: ICharacter) {

        let response = await save_character(character);
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }

        $goto("/character_sheets");

    }

    async function on_submit(event: CustomEvent<ICharacterSubmission>) {

        let response = await submit_to_server();
        if (response.is_err()) {
            return;
        }

        await submit_to_local(response.unwrap());

    }

</script>

<CharacterCreator on:submit={on_submit}/>