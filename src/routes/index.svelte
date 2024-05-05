
<script lang="ts">
    import TabsContainer from "../lib/tabs/TabsContainer.svelte";
    import watercolor from "../assets/watercolor.webp";
    import Manual from "./_Manual.svelte";
    import Automatic from "./_Automatic.svelte";
    import FooterControls from "./_FooterControls.svelte";
    import { init_hook } from "../lib/network";

    let tabs: string[] = ["Manual", "Automatic"];
    let selected_tab: string = tabs[0];

    function on_tab_selected(event: CustomEvent<string>) {
        selected_tab = event.detail;
    }

    init_hook();

</script>

<img src={watercolor} alt="background-watercolor" class="absolute inset-0 w-full h-full object-cover z-0"/>
<div class="z-10 absolute w-full">
    <TabsContainer {tabs} on:tab-selected={on_tab_selected}/>

    {#if selected_tab == "Manual"}
        <Manual/>
    {:else if selected_tab == "Automatic"}
        <Automatic/>
    {/if}
</div>
<FooterControls/>