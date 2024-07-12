
<script lang="ts">

    import DOMPurify from "isomorphic-dompurify";
    import { settings } from "../../lib/network/settings";
    import { get_name_by_global_id } from "../../lib/game_data";
    import { fetch_achievement } from "./utils";
    import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";

    export let fragment: HyperLinkAchievement;
    let name: string | undefined = undefined;

    let show_content: boolean = false;
    let content_fetched: boolean = false;
    let render_section: HTMLDivElement | undefined = undefined;

    function fetch_jediapedia_content() {

        if (content_fetched) {
            return;
        }

        fetch_achievement(fragment.id, (result) => {

            if (result.is_ok()) {

                content_fetched = true;
                render_section!.innerHTML = DOMPurify.sanitize(result.unwrap());
                
            }

        });

    }

    function attempt_prefetch() {

        if ($settings.chat_log.window.prefetch_hyperlinks) {
            fetch_jediapedia_content();
        }

    }

    get_name_by_global_id(fragment.id).then((result) => {

        if (result.is_ok()) {

            name = result.unwrap();
            attempt_prefetch();

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