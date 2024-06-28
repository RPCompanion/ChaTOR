
<script lang="ts">

    import { custom_channels } from "../lib/network/custom_channels";
    import type { ChannelDispatcher } from "../lib/network/settings";
    import { ESwtorChannel } from "../lib/network/swtor_channel";
    import { createEventDispatcher } from "svelte";

    export let channels: ChannelDispatcher[] = [];
    export let show_custom_channels: boolean = false;

    let select_channel_numbers: number[]   = [];
    let selected_custom_channels: string[] = [];

    $: select_channel_numbers = channels
        .filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c)
        .map((c) => c.RegularDispatch);

    $: selected_custom_channels = channels
        .filter((c): c is { CustomDispatch: string } => "CustomDispatch" in c)
        .map((c) => c.CustomDispatch);

    const dispatch = createEventDispatcher();
    function on_channel_input(channel: string) {

        let channel_number = Number(ESwtorChannel[channel as keyof typeof ESwtorChannel]);

        let index = channels.findIndex((c) => "RegularDispatch" in c && c.RegularDispatch == channel_number);

        if (index == -1) {
            channels.push({RegularDispatch: channel_number});
        } else {
            channels.splice(index, 1);
        }

        dispatch("channel_input", { channels: channels });

    }

    function on_custom_channel_input(channel: string) {

        let index = channels.findIndex((c) => "CustomDispatch" in c && c.CustomDispatch == channel);

        if (index == -1) {
            channels.push({CustomDispatch: channel});
        } else {
            channels.splice(index, 1);
        }

        dispatch("channel_input", { channels: channels });

    }

    function swtor_channel_is_checked(channel: string): boolean {

        return select_channel_numbers
            .includes(Number(ESwtorChannel[channel as keyof typeof ESwtorChannel]));

    }

</script>

{#each Object.keys(ESwtorChannel).filter((key) => isNaN(Number(key))) as channel}
    <div class="flex flex-row gap-1">
        <input 
            type="checkbox" 
            id={channel} 
            name={channel} 
            value={channel} 
            checked={swtor_channel_is_checked(channel)} 
            on:input={() => { on_channel_input(channel) }} 
            class="text-xl"
        >
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
                checked={selected_custom_channels.includes(channel.channel_name)}
                on:input={() => { on_custom_channel_input(channel.channel_name) }}
                class="text-xl">
            <label for={channel.channel_name} class="text-white text-xl">{channel.channel_name}</label>
        </div>
    {/each}
{/if}