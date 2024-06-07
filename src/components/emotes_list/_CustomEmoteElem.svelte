
<script lang="ts">

    import { ArrowsOutCardinal } from "phosphor-svelte";
    import { fade } from "svelte/transition";
    import { dragHandle } from "svelte-dnd-action";
    import { toast } from "@zerodevx/svelte-toast";
    import type { IDNDCustomEmote } from "../../lib/custom_emote_utils";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { submit_post } from "../../lib/network";

    export let emote: IDNDCustomEmote;
    export let favourite: boolean = false;

    let show_drag_handle: boolean = false;
    async function on_click() {

        let response = await submit_post("ButtonEmote", [emote.emote]);
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
        }

    }

    function on_mouse_enter() {
        show_drag_handle = true;
    }

    function on_mouse_leave() {
        show_drag_handle = false;
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="relative rounded-md"
    on:mouseenter={on_mouse_enter}
    on:mouseleave={on_mouse_leave}
>
    {#if show_drag_handle}
        <div use:dragHandle class="w-4 h-4 -top-1 -left-1 absolute " aria-label="drag-handle for {emote.emote_name}" transition:fade|local="{{ duration: 500 }}">
            <ArrowsOutCardinal class="text-white"/>
        </div>
    {/if}
    <VariableSizeButton on:click={on_click} my_classes="bg-yellow-500 text-black text-xl px-2 rounded-md hover:text-white">{emote.emote_name}</VariableSizeButton>
</div>