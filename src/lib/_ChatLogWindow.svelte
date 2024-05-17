
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { swtor_messages } from "./network/swtor_message";
    import { afterUpdate } from "svelte";
    import Checkbox from "./Checkbox.svelte";

    let auto_scroll: boolean = true;
    let container: HTMLElement | undefined = undefined;
    let last_message: HTMLElement | undefined = undefined;
    const dispatch = createEventDispatcher();

    function on_character_click(character_name: string) {
        dispatch("whisper", { character_name: character_name });
    }

    function scroll_container() {

        if (last_message == undefined) {
            return;
        }

        if (!auto_scroll) {
            return;
        }

        last_message.scrollIntoView({ behavior: "smooth", block: "end" });

    }

    afterUpdate(() => {
        scroll_container();
    });

</script>

<div class="w-full">
    <Checkbox bind:checked={auto_scroll} size="small">Auto scroll</Checkbox>
</div>
<div bind:this={container} class="flex flex-col h-44 max-h-96 resize-y  rounded-md border-2 border-slate-700 overflow-y-auto chat-container-background">
    {#each $swtor_messages as message}

        <div bind:this={last_message} class="w-full opacity-100">

            {#if message.timestamp != null}
                <span class="text-white">[{message.timestamp}]</span>
            {/if}

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="text-slate-200 cursor-pointer" on:click={() => {on_character_click(message.character_name)}}>{message.character_name}:</span>

            <span class="" style="color: rgb({message.color.r}, {message.color.g}, {message.color.b})">{message.message}</span>
        </div>

    {/each}
</div>

<style>

</style>