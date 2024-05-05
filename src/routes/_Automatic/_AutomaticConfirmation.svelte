
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
        <div class="flex flex-col gap-2 absolute w-36 bg-slate-800">
            {#each messages as message, idx}
                <div class="text-white">{message}</div>
            {/each}
            <button type="button" on:click={on_cancel}>Cancel</button>
        </div>
    </div>
{/if}