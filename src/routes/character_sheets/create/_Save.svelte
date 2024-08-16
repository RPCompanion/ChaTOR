

<script lang="ts">
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";

    export let sheet: ICharacterSheet;
    export let server_id: number;
    export let template_id: number;
    
    const dispatch = createEventDispatcher();

    function on_submit() {

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
<div class="flex flex-row justify-center gap-1">
    <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
    <VariableSizeButton on:click={on_submit}>Submit</VariableSizeButton>
</div>