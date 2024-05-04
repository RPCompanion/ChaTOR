
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    import Tab from "./Tab.svelte";
    export let tabs: string[];

    let selected_tab: string = tabs[0];

    const dispatch = createEventDispatcher();
    function on_tab_clicked(event: CustomEvent<string>) {
        selected_tab = event.detail;
        dispatch("tab-selected", selected_tab);
    }

</script>

<div class="flex flex-row gap-1">
    {#each tabs as tab}
        <Tab {tab} {selected_tab} on:tab-clicked={on_tab_clicked}/>
    {/each}
</div>