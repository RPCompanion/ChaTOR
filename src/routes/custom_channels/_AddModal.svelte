
<script lang="ts">

    import { custom_channels, custom_channel_save } from "../../lib/network/custom_channels";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { toast_error } from "../../lib/utils";
    import { channel_name_valid, MAX_CHANNEL_NAME_LENGTH } from "./custom_channels";

    const dispatch = createEventDispatcher();

    let channel_name = "";
    let channel_numbers: number[] = [4, 5, 6, 7, 8, 9, 0]
        .filter((channel_number) => $custom_channels.find((c) => c.channel_number == channel_number) == undefined);

    let channel_number = channel_numbers[0];

    function on_cancel() {

        dispatch("cancel");

    }

    async function on_save() {

        let result = channel_name_valid(channel_name);

        if (result.is_err()) {
            toast_error(result.unwrap_err());
            return;
        }

        let response = await custom_channel_save({
            channel_name: channel_name,
            channel_number: channel_number
        });

        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }

        dispatch("cancel");
        
    }

    function on_channel_input() {

        if (channel_name.length > MAX_CHANNEL_NAME_LENGTH) {
            channel_name = channel_name.slice(0, MAX_CHANNEL_NAME_LENGTH);
        }

    }

</script>

<div class="absolute bg-slate-600 rounded-md w-1/2 p-2 container-position" transition:fly|local="{{ duration: 500, y: -1000 }}">
    <div class="w-full flex flex-col gap-2 items-center">
        <input 
            type="text" 
            class="rounded-md outline-none border-2 border-slate-700 px-2" 
            placeholder="channel name" 
            max="16" 
            bind:value={channel_name}
            on:input={on_channel_input}
        />
        <label for="channel-select" class="text-white text-xl">Channel</label>
        <select class="rounded-md w-1/3 outline-slate-700 border-2 border-slate-700" id="channel-select" bind:value={channel_number}>
            {#each channel_numbers as number}
                <option value={number}>{number}</option>
            {/each}
        </select>
    </div>
    <div class="h-2"></div>
    <div class="flex flex-row gap-1 w-full justify-center">
        <VariableSizeButton on:click={on_save}>Save</VariableSizeButton>
        <VariableSizeButton on:click={on_cancel}>Cancel</VariableSizeButton>
    </div>
</div>

<style>
    .container-position {
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>