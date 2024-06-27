
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>


<button class="bg-slate-700 px-2 text-white text-xl hover:text-gray-500" style="border-radius: 50%" on:click={() => { dispatch("click"); }}>X</button>