
<script lang="ts">

    import { fade } from "svelte/transition";
    import { Funnel } from "phosphor-svelte";
    import ChannelList from "../../components/_ChannelList.svelte";
    import { get_all_channel_ids } from "../../lib/network/swtor_channel";
    import SmallButton from "../../lib/buttons/SmallButton.svelte";

    export let channel_filters: number[] = [];
    let show_filters: boolean = false;

    function select_all_channels() {
        channel_filters = get_all_channel_ids();
    }

    function deselect_all_channels() {
        channel_filters = [];
    }

    function on_channel_input(e: CustomEvent<{channels: number[]}>) {
        channel_filters = e.detail.channels;
    }

</script>

<button class="hover:text-gray-400 text-white" on:click={() => { show_filters = !show_filters }}>
    <Funnel size={24}/>
</button>
{#if show_filters}
    <div class="absolute top-10 z-10 bg-slate-600 p-2 rounded-md shadow-md" transition:fade|local="{{ duration: 250 }}">
        <ChannelList bind:channels={channel_filters} on:channel_input={on_channel_input}/>
        <div class="flex flex-row gap-2">
            <SmallButton on:click={select_all_channels}>Select All</SmallButton>
            <SmallButton on:click={deselect_all_channels}>Deselect All</SmallButton>
        </div>
    </div>
{/if}