<script lang="ts">

    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { goto } from "@roxi/routify";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { get_all_characters, type ICharacter } from "../../lib/network/characters";
    import CharacterSheetViewer from "../../components/_CharacterSheetViewer.svelte";
    import { character } from "./update/character_sheets_update";

    let characters: ICharacter[] = [];
    let shown_character: ICharacter | undefined = undefined;

    async function init() {

        let response = await get_all_characters();
        if (response.is_err()) {
            console.error(response.unwrap_err());
            return;
        }
        characters = response.unwrap();

    }    

    function on_create_character() {

        $goto("/character_sheets/create");

    }

    function on_character_click(character: ICharacter) {
            
        shown_character = character;

    }

    function on_back() {

        shown_character = undefined;

    }

    function on_update() {

        $character = shown_character;
        $goto("/character_sheets/update");

    }

    init();

</script>



{#if shown_character != undefined}

    <CharacterSheetViewer server_id={shown_character.server_id} sheet={shown_character.character_sheet}/>
    <div class="h-6"></div>
    <div class="flex flex-row justify-center gap-2">
        <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
        <VariableSizeButton on:click={on_update}>Update</VariableSizeButton>
    </div>

{:else}

    <PageFormatting title="Character Sheets">
        {#if characters.length != 0}

            <div class="flex flex-col gap-2 items-center">
                {#each characters as character}
                    <button class="bg-slate-600 px-2 rounded-md hover:bg-slate-700" on:click={() => { on_character_click(character);}}>
                        <p class="text-white text-2xl text-left">{character.character_sheet.name}</p>
                        {#if character.character_sheet.description != undefined && character.character_sheet.description != ""}
                            <p class="text-white text-sm">{character.character_sheet.description}</p>
                        {/if}
                    </button>
                {/each}
            </div>
            
            <div class="h-6"></div>

        {/if}

        <div class="flex flex-row justify-center">
            <VariableSizeButton on:click={on_create_character}>Create Character</VariableSizeButton>
        </div>
    </PageFormatting>

{/if}
