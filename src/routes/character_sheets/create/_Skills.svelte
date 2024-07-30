
<script lang="ts">
    import type { ICharacterSheet } from "../../../lib/character_sheet/character_sheet";
    import type { ISkill } from "../../../lib/character_template/attributes";
    import type { CharacterTemplate } from "../../../lib/character_template/character_template";

    export let template: CharacterTemplate;
    export let sheet: ICharacterSheet;    
    export let skills: ISkill[];

</script>