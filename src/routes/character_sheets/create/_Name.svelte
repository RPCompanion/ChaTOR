
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import { toast_error } from "../../../lib/utils";
    import { get_sheet_config } from "@chator/character-sheet";

    export let sheet: ICharacterSheet;

    const SHEET_CONFIG = get_sheet_config();
    const MAX_CHARACTER_NAME_LENGTH      = SHEET_CONFIG.name.max_length;
    const MAX_DESCRIPTION_LENGTH: number = SHEET_CONFIG.description.max_length;

    const dispatch = createEventDispatcher();
    function on_name_input() {

        if (sheet.name.length > MAX_CHARACTER_NAME_LENGTH) {
            sheet.name = sheet.name.substring(0, MAX_CHARACTER_NAME_LENGTH);
        }

    }

    function on_description_input() {

        if (sheet.description == undefined) {
            sheet.description = "";
        }

        if (sheet.description.length > MAX_DESCRIPTION_LENGTH) {
            sheet.description = sheet.description.substring(0, MAX_DESCRIPTION_LENGTH);
        }

    }

    function on_next() {

        if (sheet.name.length <= 2) {
            toast_error("Character name must be at least 3 characters long.");
            return;
        }

        dispatch("next");

    }

</script>

<div class="flex flex-col gap-2">
    <input 
        type="text" 
        placeholder="Character Name" 
        class="rounded-md px-1 outline-slate-500 w-96 text-xl" 
        bind:value={sheet.name} 
        on:input={on_name_input}
    />
    <textarea 
        placeholder="Character Description" 
        class="min-h-96 rounded-md px-1 outline-slate-500 text-xl" 
        bind:value={sheet.description} 
        on:input={on_description_input}/>
    <VariableSizeButton on:click={on_next}>Next</VariableSizeButton>
</div>