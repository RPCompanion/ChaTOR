
<script lang="ts">

    import { 
        custom_channels,
        custom_channel_delete,
        custom_channel_save,
        type ICustomChannel 
    } from "../../lib/network/custom_channels";
    import XButton from "../../lib/buttons/XButton.svelte";
    import { toast_error } from "../../lib/utils";

    export let channel: ICustomChannel;

    function get_available_channels(existing_channel_number: number): number[] {

        let temp = [4, 5, 6, 7, 8, 9, 0]
            .filter((channel_number) => $custom_channels.find((c) => c.channel_number == channel_number) == undefined);

        temp.push(existing_channel_number);
        temp.sort((a, b) => a - b);
        return temp;

    }

    async function on_delete() {

        let result = await custom_channel_delete(channel);
        if (result.is_error()) {

            toast_error(result.unwrap_error());

        }

    }

</script>

<div class="flex flex-row gap-2 w-full justify-center px-10">
    <input type="text" bind:value={channel.channel_name} class="rounded-md outline-slate-700 border-2 border-slate-700 px-2"/>
    <div class="flex flex-row gap-2">
        <div class="text-white text-xl">Channel Number</div>
        <select id="" bind:value={channel.channel_number} class="rounded-md outline-slate-700 border-2 border-slate-700 px-2">
            {#each get_available_channels(channel.channel_number) as number}
                <option value={number}>{number}</option>
            {/each}
        </select>
        <XButton on:click={on_delete}/>
    </div>
</div>