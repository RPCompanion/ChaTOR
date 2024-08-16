
<script lang="ts">

    import { createEventDispatcher, onMount } from "svelte";
    import { type IMinifiedCharacterTemplate, fetch_templates, fetch_template } from "../../../lib/api/template";
    import { toast_error } from "../../../lib/utils";
    import { CharacterTemplate } from "../../../lib/character_template/character_template";

    const dispatch = createEventDispatcher();

    let minified_templates: IMinifiedCharacterTemplate[] = [];
    async function on_select(template_id: number) {

        let result = await fetch_template(template_id);
        if (result.is_err()) {
            toast_error(result.unwrap_err());
            return;
        }

        dispatch("selected_template", {template_id: template_id, template: new CharacterTemplate(result.unwrap())});

    }

    function get_version_string(version: [number, number, number]): string {

        return `${version[0]}.${version[1]}.${version[2]}`;

    }

    onMount(async () => {
        
        let result = await fetch_templates();
        if (result.is_err()) {
           toast_error(result.unwrap_err()); 
           return;
        }

        minified_templates = result.unwrap();

    });

</script>

<div class="flex flex-col gap-2">
    {#each minified_templates as m_template}
        <button on:click={() => on_select(m_template.template_id)} class="rounded-md bg-slate-500 hover:bg-slate-600">
            <h2 class="text-white text-xl"><b>{m_template.name}</b></h2>
            <p class="text-white text-xl">{m_template.description}</p>
            <p class="text-white">Version: {get_version_string(m_template.version)}</p>
        </button>
    {/each}
</div>