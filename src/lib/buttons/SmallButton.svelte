
<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    function on_click() {
        dispatch("click");
    }

</script>

<button type="button" class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={on_click}>
    <slot></slot>
</button>