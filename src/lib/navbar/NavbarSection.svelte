
<script lang="ts">

    import { slide } from "svelte/transition";
    import { goto } from "@roxi/routify";
    import { type INavbarSection } from "./navbar";

    export let section: INavbarSection;

    let show_dropdown = false;
    function toggle_dropdown() {
        show_dropdown = !show_dropdown;
    }

    function goto_link(link: string) {
        show_dropdown = false;
        $goto(link);
    }

</script>

<div class="relative">
    <button type="button" on:click={toggle_dropdown} class="flex flex-row gap-1 relative text-white px-2 top-2 hover:text-gray-400">
        <div class="text-xl">{section.name}</div>
        <div class="relative top-2 text-xs">&#9660;</div>
    </button>
    {#if show_dropdown}
        <div class="flex flex-col gap-1 bg-white p-2 relative top-2 shadow-md" in:slide={{duration: 300}}>
            {#each section.elements as element}
                <button type="button" on:click={() => { goto_link(element.link); }} class="hover:text-slate-500 text-center">{element.name}</button>
            {/each}
        </div>
    {/if}
</div>

