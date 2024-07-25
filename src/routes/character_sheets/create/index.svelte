
<script lang="ts">

    import PageFormatting from "../../../components/_PageFormatting.svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    import { type ICharacterTemplate } from "../../../lib/character_template/character_template";
    import { CharacterTemplate } from "../../../lib/character_template/character_template";
    import standard from './standard';
    import { goto } from "@roxi/routify";
    import JSON5 from 'json5';
    

    let template: ICharacterTemplate = JSON5.parse(standard);
    let builder = new CharacterTemplate(template);

    function on_back() {
        $goto("/character_sheets");
    }

</script>

<PageFormatting title="Create Character Sheet">
    <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
</PageFormatting>