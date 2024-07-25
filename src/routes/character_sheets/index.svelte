<script lang="ts">

    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { goto } from "@roxi/routify";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";

    function on_create_character() {
        $goto("/character_sheets/create");
    }

</script>

<PageFormatting title="Character Sheets">
    <div class="flex flex-row justify-center">
        <VariableSizeButton on:click={on_create_character}>Create Character</VariableSizeButton>
    </div>
</PageFormatting>
