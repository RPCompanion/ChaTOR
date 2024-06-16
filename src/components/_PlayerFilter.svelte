
<script lang="ts">

    import { fade } from "svelte/transition";
    import SmallButton from "../lib/buttons/SmallButton.svelte";
    import SelectList from "./_SelectList.svelte";
    import { type IListElem } from "./select_list";
    import { UserList } from "phosphor-svelte";
    import { click_outside_handler } from "../lib/click_outside";
    import Tooltip from "./_Tooltip.svelte";

    export let elems: IListElem<string>[];
    
    let mouse_over: boolean = false;
    let show_filters: boolean = false;
    let player_search: string = "";

    function clear_player_search() {
        player_search = "";
    }

    function toggle_show_filters() {
        show_filters = !show_filters;
        clear_player_search();
    }

    function click_outside() {

        if (!mouse_over) {
            show_filters = false;
            clear_player_search();
        }

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

<Tooltip placement="left" tooltip_text="Filter out players">
    <button class="hover:text-gray-400 text-white" on:click={toggle_show_filters} on:mouseenter={() => {mouse_over = true}} on:mouseleave={() => {mouse_over = false}}>
        <UserList size={26}/>
    </button>
</Tooltip>

{#if show_filters}
    <div class="absolute top-10 z-10 bg-slate-600 p-2 rounded-md shadow-md " transition:fade|local="{{ duration: 250 }}" use:click_outside_handler={click_outside}>
        <div class="text-white text-xl text-center">Players</div>
        <div class="w-full">
            <input type="text" bind:value={player_search} placeholder="Search for player" class="w-full px-2 rounded-md outline-none border-2 border-slate-700">
        </div>
        <div class="h-2"></div>
        <div class="max-h-96 overflow-y-auto">
            <SelectList bind:elems={elems} on:input={input} search={player_search.toLowerCase()}/>
        </div>
        <div class="h-2"></div>
        <div class="flex flex-row gap-2">
            <SmallButton on:click={select_all}>Select All</SmallButton>
            <SmallButton on:click={deselect_all}>Deselect All</SmallButton>
        </div>
    </div>
{/if}