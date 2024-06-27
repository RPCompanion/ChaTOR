
<script lang="ts">

    import { Result, Ok, Err } from "../../lib/result";
    import { custom_channels, custom_channel_save, type ICustomChannel } from "../../lib/network/custom_channels";
    import { fly } from "svelte/transition";
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { toast_error } from "../../lib/utils";

    const MIN_CHANNEL_NAME_LENGTH: number = 1;
    const MAX_CHANNEL_NAME_LENGTH: number = 16;
    const dispatch = createEventDispatcher();

    let channel_name = "";
    let channel_numbers: number[] = [4, 5, 6, 7, 8, 9, 0]
        .filter((channel_number) => $custom_channels.find((c) => c.channel_number == channel_number) == undefined);

    let channel_number = channel_numbers[0];

    function on_cancel() {

        dispatch("cancel");

    }

    function channel_name_valid(): Result<[], string> {

        channel_name = channel_name.trim();

        if (channel_name.length == 0) {
            return Err("Channel name cannot be empty");
        }

        if (channel_name.length > MAX_CHANNEL_NAME_LENGTH) {
            return Err("Channel name cannot exceed 16 characters");
        }

        return Ok([]);

    }

    async function on_save() {

        let result = channel_name_valid();

        if (result.is_error()) {
            toast_error(result.unwrap_error());
            return;
        }

        let response = await custom_channel_save({
            channel_name: channel_name,
            channel_number: channel_number
        });

        if (response.is_error()) {
            toast_error(response.unwrap_error());
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