

<script lang="ts">
    
    import { goto } from "@roxi/routify";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import { create_character, type ICreateCharacter} from "../../../lib/api/character";
    import { type ICharacter, save_character } from "../../../lib/network/characters";
    import { toast_error } from "../../../lib/utils";
    import CharacterSheetViewer from "../../../components/_CharacterSheetViewer.svelte";
    import Tooltip from "../../../components/_Tooltip.svelte";
    import { Err, Ok, type Result } from "../../../lib/result";

    export let sheet: ICharacterSheet;
    export let server_id: number;
    export let template_id: number;
    
    const dispatch = createEventDispatcher();

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

    async function on_submit() {

        let response = await submit_to_server();
        if (response.is_err()) {
            return;
        }

        await submit_to_local(response.unwrap());

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
    <Tooltip tooltip_text="Export character to a file" placement="left">
        <button type="button" class="text-white text-xl hover:text-gray-400" on:click={on_export}>Export</button>
    </Tooltip>
</div>

<CharacterSheetViewer {sheet} {server_id}/>
<div class="h-6"></div>

<div class="flex flex-row justify-center gap-1">
    <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
    <VariableSizeButton on:click={on_submit}>Submit</VariableSizeButton>
</div>