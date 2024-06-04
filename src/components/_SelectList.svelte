
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    import type { IListElem } from "./select_list";

    export let elems: IListElem<string>[];
    export let search: string | undefined = undefined;

    const dispatch = createEventDispatcher();
    function on_input(elem: IListElem<string>) {

        elem.selected = !elem.selected;
        dispatch("input", elems);

    }

</script>

{#if search == undefined}
    {#each elems as elem}
        <div class="flex flex-row gap-1">
            <input type="checkbox" value={elem.selected} checked={elem.selected} on:input={() => { on_input(elem) }} class="text-xl">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="text-white text-xl">{elem.value}</label>
        </div>
    {/each}
{:else}
    {#each elems.filter((m) => m.value.toLowerCase().includes(search)) as elem}
        <div class="flex flex-row gap-1">
            <input type="checkbox" value={elem.selected} checked={elem.selected} on:input={() => { on_input(elem) }} class="text-xl">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="text-white text-xl">{elem.value}</label>
        </div>
    {/each}        
{/if}