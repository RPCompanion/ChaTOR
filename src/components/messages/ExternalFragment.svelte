
<script lang="ts">

    import DOMPurify from "isomorphic-dompurify";
    import { fly } from 'svelte/transition';

    import { settings } from "../../lib/network/settings";
    import { HyperLinkItem } from "../../lib/hyperlink/item";
    import { HyperLinkAchievement } from "../../lib/hyperlink/achievement";
    import { get_name_by_global_id } from "../../lib/game_data";
    import { fetch_achievement, fetch_item } from "./utils";
    import type { Result } from "../../lib/result";
    import XButton from "../../lib/buttons/XButton.svelte";

    type FetchType = (global_id: bigint, callback: (result: Result<string, string>) => void) => void;

    export let fragment: HyperLinkItem | HyperLinkAchievement;
    const fetch_function: FetchType = get_fetch_function();

    let name: string | undefined = undefined;
    let show_content: boolean = false;

    let content: string | undefined = undefined;
    let render_section: HTMLDivElement | undefined = undefined;

    $: if (render_section != undefined) {
        update_render_section();
    }

    function update_render_section() {

        if (render_section == undefined) {
            return;
        }

        if (render_section.innerHTML == "") {
            render_section.innerHTML = content ?? "";
        }

    }

    function get_fetch_function(): FetchType {

        if (fragment instanceof HyperLinkItem) {
            return fetch_item;
        } else {
            return fetch_achievement;
        }

    }

    function fetch_jediapedia_content() {

        if (content != undefined) {
            return;
        }

        fetch_function(fragment.id, (result) => {

            if (result.is_ok()) {
                content = DOMPurify.sanitize(result.unwrap());
                update_render_section();
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

    function on_x() {
        show_content = false;
    }

</script>

{#if name != undefined}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="break-words text-yellow-300 cursor-pointer select-none" on:click={on_click}>{"{" + name + "}"}</span>
{:else}
    <span class="break-words text-yellow-300 select-none">{"<Loading>"}</span>
{/if}

{#if show_content && content != undefined}
    <div class="fixed top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-center" transition:fly|local="{{ duration: 300, y: -1000 }}">
        <div class="relative w-96 h-96">
            <div bind:this={render_section}></div>
            <div class="absolute right-0 top-0">
                <XButton on:click={on_x}></XButton>
            </div>
        </div>
    </div>
{/if}

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