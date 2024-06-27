

<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let my_classes: string = "bg-slate-700 text-white text-2xl px-2 rounded-md hover:text-gray-500 select-none";

    const dispatch = createEventDispatcher();
    function on_click() {
        dispatch("click");
    }

</script>

<button type="button" class={my_classes} on:click={on_click}>
    <slot></slot>
</button>