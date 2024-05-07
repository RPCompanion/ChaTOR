
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    export let text: string = "";

    const dispatch = createEventDispatcher();

    function on_click() {
        dispatch("click");
    }

</script>

<button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm hover:text-gray-300 text-xl" on:click={on_click}>{text}</button>
