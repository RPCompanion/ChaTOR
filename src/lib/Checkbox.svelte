
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    export let checked: boolean = false;
    export let size: string = "normal";

    const dispatch = createEventDispatcher();
    $: dispatch("checked", checked);

</script>


<label class="text-white bg-slate-900 rounded-md shadow-lg p-1" class:text-md={size == "small"} class:text-xl={size == "normal"}>
    <input type="checkbox" bind:checked={checked} class="ml-2 scale-150"/>
    <slot></slot>
</label>