
<script lang="ts">
    import type { IPerk } from "../../../lib/character_template/perk";

    export let perk: IPerk;
</script>

<div class="px-2">
    {#if perk.base_health_modifier != undefined}
        <p>Health Modifier: {perk.base_health_modifier}</p>
    {/if}
    {#if perk.base_armor_class_modifier != undefined}
        <p>Armor Modifier: {perk.base_armor_class_modifier}</p>
    {/if}
</div>