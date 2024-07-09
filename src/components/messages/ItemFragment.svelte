<script lang="ts">

    import type { HyperLinkItem } from "../../lib/hyperlink/item";
    import { get_name_by_global_id } from "../../lib/game_data";
    import { fetch_item } from "./utils";

    export let fragment: HyperLinkItem;
    const URL = "https://swtor.jedipedia.net/en/itm/" + fragment.id;
    let name: string | undefined = undefined;
    let show_iframe: boolean = false;

    const parser = new DOMParser();
    let doc: Document | undefined    = undefined;
    let section: Element | undefined = undefined;

    let render_section: HTMLDivElement | undefined = undefined;

    function fetch_jediapedia_content() {

        if (doc != undefined) {
            return;
        }

        fetch_item(fragment.id, (result) => {

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

        show_iframe = !show_iframe;
        if (show_iframe) {
            fetch_jediapedia_content();
        }

    }

</script>

{#if name != undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="break-words text-yellow-300 cursor-pointer" on:click={on_click}>{"{" + name + "}"}</span>
{:else}
    <span class="break-words text-yellow-300">{"<Loading>"}</span>
{/if}
<div bind:this={render_section} class:hidden={!show_iframe}></div>

<style>
    :global(.con-inv) {
        padding: 5px 0 0 0;
        border: 0;
        background-color: transparent;
    }
    :global(.tooltip) {
        background-color: #001f31;
        box-shadow: inset 0 0 78px #000f21;
        padding: 0 10px 5px 10px;
        border: 3px solid #51a5bc;
        border-radius: 15px;
    }
    :global(.tooltip-itm) {
        max-width: 420px;
        margin-left: 58px;
    }
    :global(.tt-title) {
        margin: 5px 0;
        font-size: 18px;
        color: #ffbb29;
    }
    :global(.tt-main) {
        margin: 0 0 14px 5px;
        font-size: 14px;
        line-height: 15px;
    }
    :global(.tt-blue) {
        color: #3ed3f4;
    }
    :global(.tt-amber) {
        color: #ffbb29;
    }
    :global(.tt-gift) {
        color: #ff005a;
    }
    :global(.tt-green) {
        color: #33ff4e;
    }
    :global(.tt-easy) {
        color: #63f578;
    }
    :global(.tt-white) {
        color: #96e3ff;
    }
    :global(.tt-indent) {
        padding-left: 10pt;
    }
    :global(.tt-indent2) {
        padding-left: 20pt;
    }
</style>
