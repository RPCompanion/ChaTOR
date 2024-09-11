

<script lang="ts">
    
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../lib/character_sheet/character_sheet";
    import CharacterSheetViewer from "../_CharacterSheetViewer.svelte";
    import Tooltip from "../_Tooltip.svelte";

    export let sheet: ICharacterSheet;
    export let server_id: number;
    export let template_id: number;
    
    const dispatch = createEventDispatcher();

    function on_submit() {

        dispatch("submit", { sheet: sheet, server_id: server_id, template_id: template_id })

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