

<script lang="ts">
    
    import { goto } from "@roxi/routify";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import { create_character, save_character_locally, type ICreateCharacter, type ICharacter } from "../../../lib/api/character";
    import { toast_error } from "../../../lib/utils";
    import CharacterSheetViewer from "../../../components/_CharacterSheetViewer.svelte";

    export let sheet: ICharacterSheet;
    export let server_id: number;
    export let template_id: number;
    
    const dispatch = createEventDispatcher();

    async function on_submit() {

        const c_char: ICreateCharacter = {
            server_id: server_id,
            template_id: template_id,
            sheet: sheet
        };

        let response = await create_character(c_char);
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }

        let character: ICharacter = {
            public_id: response.unwrap().public_id,
            character_sheet: sheet
        }
        
        {
            let response = await save_character_locally(character);
            if (response.is_err()) {
                toast_error(response.unwrap_err());
                return;
            }
            $goto("/character_sheets");
        }

    }

    function on_back() {

        dispatch("back");

    }

    async function on_export() {

        const filepath = await save({
            filters: [{ name: "Text Files", extensions: ["json"] }]
        });

        if (filepath == undefined) {
            return;
        }

        await writeTextFile(filepath, JSON.stringify(sheet));

    }

</script>

<div class="flex flex-row-reverse">
    <button type="button" class="text-white text-xl hover:text-gray-400" on:click={on_export}>Export</button>
</div>

<CharacterSheetViewer {sheet}/>

<div class="flex flex-row justify-center gap-1">
    <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
    <VariableSizeButton on:click={on_submit}>Submit</VariableSizeButton>
</div>