
<script lang="ts">

    import { 
        custom_channels,
        custom_channel_delete,
        custom_channel_save,
        type ICustomChannel 
    } from "../../lib/network/custom_channels";
    import XButton from "../../lib/buttons/XButton.svelte";
    import { deep_copy, toast_error } from "../../lib/utils";
    import { channel_name_valid } from "./custom_channels";

    export let channel: ICustomChannel;
    let channel_cache = deep_copy(channel);

    function get_available_channels(existing_channel_number: number): number[] {

        let temp = [4, 5, 6, 7, 8, 9, 0]
            .filter((channel_number) => $custom_channels.find((c) => c.channel_number == channel_number) == undefined);

        temp.push(existing_channel_number);
        temp.sort((a, b) => a - b);
        return temp;

    }

    async function on_delete() {

        let result = await custom_channel_delete(channel);
        if (result.is_err()) {

            toast_error(result.unwrap_err());

        }

    }

    async function on_change() {

        let valid = channel_name_valid(channel.channel_name);
        if (valid.is_err()) {

            toast_error(valid.unwrap_err());
            channel.channel_name = channel_cache.channel_name;
            return;

        }

        let result = await custom_channel_save(channel);
        if (result.is_err()) {

            toast_error(result.unwrap_err());
            
        }

        channel_cache = deep_copy(channel);

    }

</script>

<div class="flex flex-row gap-2 w-full justify-center px-10 select-none">
    <input type="text" bind:value={channel.channel_name} class="rounded-md outline-slate-700 border-2 border-slate-700 px-2" on:focusout={on_change}/>
    <div class="flex flex-row gap-2">
        <div class="text-white text-xl">Channel Number</div>
        <select id="" bind:value={channel.channel_number} on:change={on_change} class="rounded-md outline-slate-700 border-2 border-slate-700 px-2">
            {#each get_available_channels(channel.channel_number) as number}
                <option value={number}>{number}</option>
            {/each}
        </select>
        <XButton on:click={on_delete}/>
    </div>
</div>