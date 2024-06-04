
<script lang="ts" generics="T">

    import { createEventDispatcher } from "svelte";
    import type { IListElem } from "./select_list";
    export let elems: IListElem<T>[];

    const dispatch = createEventDispatcher();
    function on_input(elem: IListElem<T>) {

        elem.selected = !elem.selected;
        dispatch("input", elems);

    }

</script>

{#each elems as elem}
    <div class="flex flex-row gap-1">
        <input type="checkbox" value={elem.selected} checked={elem.selected} on:input={() => { on_input(elem) }} class="text-xl">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="text-white text-xl">{elem.value}</label>
    </div>
{/each}