
<script lang="ts">

    import type { ICharacterSheet } from "../lib/character_sheet/character_sheet";
    export let sheet: ICharacterSheet;

</script>

<div class="flex flex-col items-center">
    <p class="text-white text-2xl"><b>{sheet.name}</b></p>
    <p class="text-white text-xl">{sheet.description}</p>
</div>