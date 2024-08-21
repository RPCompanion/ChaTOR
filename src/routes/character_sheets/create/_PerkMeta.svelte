
<script lang="ts">

    import type { IPerk } from "../../../lib/character_template/perk";

    export let perk: IPerk;
    const HAS_PERK_META = 
        perk.attributes != undefined || 
        perk.skills != undefined || 
        perk.base_health_modifier != undefined || 
        perk.base_armor_class_modifier != undefined;

</script>

<div class="px-2 text-white">
    {#if !HAS_PERK_META}
        <p>No additional information</p>
    {/if}

    {#if perk.attributes != undefined}
        <p><b>Attributes</b></p>
        {#each perk.attributes as attribute}
            <div class="flex flex-row gap-1">
                <p>{attribute.name}:</p>
                <p  
                    class:text-green-400={attribute.modifier > 0} 
                    class:text-red-300={attribute.modifier < 0}>
                        {attribute.modifier}
                </p>
            </div>
        {/each}
    {/if}

    {#if perk.skills != undefined}
        <p><b>Skills</b></p>
        {#each perk.skills as skill}
            <div class="flex flex-row gap-1">
                <p>{skill.name}:</p>
                <p 
                    class:text-green-400={skill.modifier > 0} 
                    class:text-red-300={skill.modifier < 0}>
                    {skill.modifier}
                </p>
            </div>
        {/each}
    {/if}

    {#if perk.base_health_modifier != undefined ||  perk.base_armor_class_modifier != undefined}
        <p><b>Other</b></p>
    {/if}
    {#if perk.base_health_modifier != undefined}
        <div class="flex flex-row gap-2">
            <p>Health Modifier:</p>
            <p 
                class:text-green-400={perk.base_health_modifier > 0} 
                class:text-red-300={perk.base_health_modifier < 0}>
                {perk.base_health_modifier}
            </p>
        </div>
    {/if}

    {#if perk.base_armor_class_modifier != undefined}
        <div class="flex flex-row gap-2">
            <p>Armor Modifier:</p>
            <p 
                class:text-green-400={perk.base_armor_class_modifier > 0} 
                class:text-red-300={perk.base_armor_class_modifier < 0}>
                {perk.base_armor_class_modifier}
            </p>
        </div>
    {/if}
</div>