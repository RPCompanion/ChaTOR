
<script lang="ts">

    import { custom_channels } from "../lib/network/custom_channels";
    import { ESwtorChannel } from "../lib/network/swtor_channel";
    import { createEventDispatcher } from "svelte";

    export let channels: number[]            = [];
    export let show_custom_channels: boolean = false;

    const dispatch = createEventDispatcher();
    function on_channel_input(channel: string) {

        let channel_number = Number(ESwtorChannel[channel as keyof typeof ESwtorChannel]);

        let index = channels.indexOf(channel_number);

        if (index == -1) {
            channels.push(channel_number);
        } else {
            channels.splice(index, 1);
        }
        dispatch("channel_input", { channels: channels });

    }

    function on_custom_channel_input(channel: string) {

    }

</script>

{#each Object.keys(ESwtorChannel).filter((key) => isNaN(Number(key))) as channel}
    <div class="flex flex-row gap-1">
        <input type="checkbox" id={channel} name={channel} value={channel} checked={channels.includes(Number(ESwtorChannel[channel]))} on:input={() => { on_channel_input(channel) }} class="text-xl">
        <label for={channel} class="text-white text-xl">{channel}</label>
    </div>
{/each}
{#if show_custom_channels}
    <div class="border-2"></div>
    <p class="text-white text-xl"><b>Custom Channels</b></p>
    {#each $custom_channels as channel}
        <div class="flex flex-row gap-1">
            <input 
                type="checkbox" 
                id={channel.channel_name} 
                name={channel.channel_name} 
                value={channel.channel_name} 
                checked={false}
                class="text-xl">
            <label for={channel.channel_name} class="text-white text-xl">{channel.channel_name}</label>
        </div>
    {/each}
{/if}