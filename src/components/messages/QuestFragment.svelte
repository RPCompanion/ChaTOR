
<script lang="ts">
    
    import type { HyperLinkQuest } from "../../lib/hyperlink/quest";
    import { get_name_by_global_id } from "../../lib/game_data";

    export let fragment: HyperLinkQuest
    let name: string | undefined = undefined;

    get_name_by_global_id(fragment.id).then((result) => {

        if (result.is_ok()) {
            name = result.unwrap();
        }
        
    });

</script>

{#if name != undefined}
    <span class="break-words text-yellow-300 select-none">{ "{" + name + "}" }</span>
{:else}
    <span class="break-words text-yellow-300 select-none">{"<Loading>"}</span>
{/if}