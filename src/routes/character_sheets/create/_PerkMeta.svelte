
<script lang="ts">
    import type { IPerk } from "../../../lib/character_template/perk";

    export let perk: IPerk;
</script>

<div class="bg-slate-600 rounded-md">
    test
    {#if perk.base_health_modifier != undefined}
        <p>Health Modifier: {perk.base_health_modifier}</p>
    {/if}
    {#if perk.base_armor_class_modifier != undefined}
        <p>Armor Modifier: {perk.base_armor_class_modifier}</p>
    {/if}
</div>