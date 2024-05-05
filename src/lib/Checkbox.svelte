
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    let checked: boolean = false;

    const dispatch = createEventDispatcher();
    $: dispatch("checked", checked);

</script>


<label class="text-white text-xl bg-slate-900 rounded-md shadow-lg p-1">
    <input type="checkbox" bind:checked={checked} class="ml-2 scale-150"/>
    <slot></slot>
</label>