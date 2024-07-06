
<script lang="ts">
    import type { HyperLinkItem } from "../../lib/hyperlink/item";
    import { get_name_by_global_id } from "../../lib/game_data";

    export let fragment: HyperLinkItem;
    const URL = "https://swtor.jedipedia.net/en/itm/" + fragment.id;
    let name: string | undefined = undefined;
    let show_iframe: boolean = false;

    get_name_by_global_id(fragment.id).then((result) => {

        if (result.is_ok()) {
            name = result.unwrap();
        }
        
    });

    function on_click() {
        show_iframe = !show_iframe;
    }

</script>

{#if name != undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="break-words text-yellow-300 cursor-pointer" on:click={on_click}>{ "{" + name + "}" }</span>
{:else}
    <span class="break-words text-yellow-300">{"<Loading>"}</span>
{/if}