
<script lang="ts">

    import { get_name_by_global_id } from "../../lib/game_data";
    import { fetch_achievement } from "./utils";
    import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";

    export let fragment: HyperLinkAchievement;
    let name: string | undefined = undefined;

    let show_content: boolean = false;
    let doc: Document | undefined = undefined;
    let render_section: HTMLDivElement | undefined = undefined;

    function fetch_jediapedia_content() {

        if (doc != undefined) {
            return;
        }

        fetch_achievement(fragment.id, (result) => {

            if (result.is_ok()) {
                render_section!.innerHTML = result.unwrap();   
            }

        });

    }

    get_name_by_global_id(fragment.id).then((result) => {

        if (result.is_ok()) {
            name = result.unwrap();
        }
        
    });

    function on_click() {

        show_content = !show_content;
        if (show_content) {
            fetch_jediapedia_content();
        }

    }

</script>

{#if name != undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="break-words text-yellow-300 select-none" on:click={on_click}>{ "{" + name + "}" }</span>
{:else}
    <span class="break-words text-yellow-300 select-none">{"<Loading>"}</span>
{/if}

<div bind:this={render_section} class:hidden={!show_content}></div>