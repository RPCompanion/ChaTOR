
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    export let tab: string;
    export let selected_tab: string;

    const dispatch = createEventDispatcher();

    function on_click() {
        dispatch("tab-clicked", tab);
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bg-slate-700 text-white p-2 cursor-pointer rounded-t-md" class:rounded-md={selected_tab == tab} on:click={on_click}>{tab}</div>