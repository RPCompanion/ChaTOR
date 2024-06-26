
<script lang="ts">

    import { slide } from "svelte/transition";
    import { goto } from "@roxi/routify";
    import { type INavbarSection, add_navbar_callback, trigger_navbar_callbacks } from "./navbar";

    export let section: INavbarSection;

    let show_dropdown = false;
    function toggle_dropdown() {
        show_dropdown = !show_dropdown;
    }

    function goto_link(link: string) {
        trigger_navbar_callbacks();
        $goto(link);
    }

    function section_click() {

        if (section.link != undefined) {
            goto_link(section.link);
            return;
        }
        
        trigger_navbar_callbacks(section.name);
        toggle_dropdown();

    }

    add_navbar_callback(section.name, () => {
        show_dropdown = false;
    });

</script>

<div class="relative">
    <button type="button" on:click={section_click} class="flex flex-row gap-1 relative text-white px-2 top-2 hover:text-gray-400 select-none">
        <div class="text-xl">{section.name}</div>
        {#if section.link == undefined}
            <div class="relative top-2 text-xs">&#9660;</div>
        {/if}
    </button>
    {#if show_dropdown}
        <div class="flex flex-col gap-1 bg-white p-2 absolute top-10 shadow-md w-36" in:slide={{duration: 300}}>
            {#if section.elements != undefined}
                {#each section.elements as element, idx}
                    <button type="button" on:click={() => { goto_link(element.link); }} class="hover:text-slate-500 text-center select-none">{element.name}</button>
                    {#if idx != section.elements.length - 1}
                        <div class="border-b-2 border-slate-500"></div>
                    {/if}
                {/each}
            {/if}
        </div>
    {/if}
</div>

