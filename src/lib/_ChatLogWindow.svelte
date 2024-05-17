
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { swtor_messages } from "./network/swtor_message";
    import { afterUpdate } from "svelte";

    let container: HTMLElement | undefined = undefined;
    const dispatch = createEventDispatcher();
    function on_character_click(character_name: string) {
        dispatch("whisper", { character_name: character_name });
    }

    function scroll_container() {

        if (container == undefined) {
            return;
        }
        container.scrollIntoView({ behavior: "smooth", block: "end" });

    }

    afterUpdate(() => {
        scroll_container();
    });

</script>

<div bind:this={container} class="flex flex-col h-44 bg-white rounded-md border-2 border-slate-500 overflow-y-auto">
    {#each $swtor_messages as message}

        <div class="w-full">

            {#if message.timestamp != null}
                <span class="">[{message.timestamp}]</span>
            {/if}

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="text-slate-500 cursor-pointer" on:click={() => {on_character_click(message.character_name)}}>{message.character_name}:</span>

            <span class="" style="color: rgb({message.color.r}, {message.color.g}, {message.color.b})">{message.message}</span>
        </div>

    {/each}
</div>