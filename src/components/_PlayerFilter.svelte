
<script lang="ts">

    import { fade } from "svelte/transition";
    import SmallButton from "../lib/buttons/SmallButton.svelte";
    import SelectList from "./_SelectList.svelte";
    import { type IListElem } from "./select_list";
    import { UserList } from "phosphor-svelte";

    export let elems: IListElem<string>[];
    
    let show_filters: boolean = false;
    function toggle_show_filters() {

        show_filters = !show_filters;

    }

    function select_all() {

        elems.forEach((elem) => {
            elem.selected = true;
        });
        elems = elems;

    }

    function deselect_all() {

        elems.forEach((elem) => {
            elem.selected = false;
        });
        elems = elems;

    }

    function input(event: CustomEvent<IListElem<string>[]>) {
        elems = event.detail;
    }

</script>

<button class="hover:text-gray-400 text-white" on:click={toggle_show_filters}>
    <UserList size={24}/>
</button>

{#if show_filters}
    <div class="absolute top-10 z-10 bg-slate-600 p-2 rounded-md shadow-md " transition:fade|local="{{ duration: 250 }}">
    <div class="text-white text-xl text-center">Players</div>
    <div class="max-h-96 overflow-y-auto">
            <SelectList bind:elems={elems} on:input={input}/>
        </div>
        <div class="flex flex-row gap-2">
            <SmallButton on:click={select_all}>Select All</SmallButton>
            <SmallButton on:click={deselect_all}>Deselect All</SmallButton>
        </div>
    </div>
{/if}