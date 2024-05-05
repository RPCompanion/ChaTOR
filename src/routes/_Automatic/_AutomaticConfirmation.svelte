
<script lang="ts">
    
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let messages: string[];
    export let show_modal: boolean = false;

    const dispatch = createEventDispatcher();
    function on_cancel() {
        dispatch("cancel");
    }

</script>

{#if show_modal}
    <div class="z-20 w-full h-full absolute left-0 top-0">
        <div class="flex flex-col gap-2 absolute w-3/4 bg-slate-700 rounded-md container-position border-black border-2">
            <div class="text-white text-2xl text-center">Posts</div>
            {#each messages as message, idx}
                <textarea class="w-full outline-none p-1 rounded-md border-2 resize-none" bind:value={messages[idx]}/>
            {/each}
            <div class="flex flex-row gap-2">
                <button type="button" class="bg-slate-800 text-white w-1/2" on:click={on_cancel}>Post</button>
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