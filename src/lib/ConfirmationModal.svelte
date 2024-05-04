
<script lang="ts">
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let show_modal: boolean = false;

    const dispatch = createEventDispatcher();

    function on_yes() {
        dispatch("yes")   
    }

    function on_no() {
        dispatch("no")   
    }

</script>

{#if show_modal}
    <div class="z-20 w-full h-full absolute left-0 top-0">
        <div class="h-36 w-40 bg-slate-800 container-position rounded-md" transition:fly|local={{duration: 500, y:-500}}>
            <div class="text-white text-xl text-center">
                <slot></slot>
            </div>
            <div class="mt-6"></div>
            <div class="flex flex-row gap-2 px-1">
                <button class="bg-slate-700 p-1 text-white rounded-md w-1/2" on:click={on_yes}>Yes</button>
                <button class="bg-slate-700 p-1 text-white rounded-md w-1/2" on:click={on_no}>No</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .container-position {
        position: absolute;
        left: calc(50% - 9rem/2);
        top: calc(50% - 10rem/2);
    }
</style>