
<script lang="ts">
    
    import { onDestroy } from "svelte";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import { GAME_MESSAGE_MAXIMUM } from "../../lib/messages";
    import { settings } from "../../lib/network/settings";

    export let messages: string[];
    export let show_modal: boolean = false;

    const dispatch = createEventDispatcher();
    function on_cancel() {
        dispatch("cancel");
    }

    function on_submit() {
        dispatch("submitted");
    }

    function on_keydown(event: KeyboardEvent) {

        if (!show_modal) {
            return;
        }

        if (event.key == "Enter" && !event.shiftKey) {
            on_submit();
        }

    }

    function add_event_listener() {

        if (!$settings.chat.enter_to_confirm) {
            return;
        }

        setTimeout(() => {
            window.addEventListener("keydown", on_keydown);
        }, 1)

    }

    function remove_event_listener() {
        window.removeEventListener("keydown", on_keydown);
    }

    $: if (show_modal) {
        add_event_listener();
    } else {
        remove_event_listener();
    }

    onDestroy(() => {
        remove_event_listener();
    });

</script>

{#if show_modal}
    <div class="z-20 w-full h-full absolute left-0 top-0">
        <div class="flex flex-col gap-2 absolute w-3/4 bg-slate-700 rounded-md container-position border-black border-2" transition:fly={{duration: 400, y: -500}}>
            <div class="text-white text-2xl text-center">Auto format - Final edits</div>
            {#each messages as message, idx}
                <textarea class="w-full outline-none p-1 rounded-md border-2 resize-none" maxlength={GAME_MESSAGE_MAXIMUM} bind:value={messages[idx]}/>
            {/each}
            <div class="flex flex-row gap-2">
                <button type="button" class="bg-slate-800 text-white w-1/2" on:click={on_submit}>Submit</button>
                <button type="button" class="bg-slate-800 text-white w-1/2" on:click={on_cancel}>Cancel</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .container-position {
        position: absolute;
        left: calc(50% - 75%/2);
        top: 100px;
    }
</style>