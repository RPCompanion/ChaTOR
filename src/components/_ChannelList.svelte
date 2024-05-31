
<script lang="ts">

    import { SwtorChannel } from "../lib/network/swtor_channel";
    import { createEventDispatcher } from "svelte";

    export let channels: number[] = [];

    const dispatch = createEventDispatcher();
    function on_channel_input(channel: string) {

        let channel_number = Number(SwtorChannel[channel as keyof typeof SwtorChannel]);

        let index = channels.indexOf(channel_number);

        if (index == -1) {
            channels.push(channel_number);
        } else {
            channels.splice(index, 1);
        }
        dispatch("channel_input", { channels: channels });

    }

</script>

{#each Object.keys(SwtorChannel).filter((key) => isNaN(Number(key))) as channel}
    <div class="flex flex-row gap-1">
        <input type="checkbox" id={channel} name={channel} value={channel} checked={channels.includes(Number(SwtorChannel[channel]))} on:input={() => { on_channel_input(channel) }} class="text-xl">
        <label for={channel} class="text-white text-xl">{channel}</label>
    </div>
{/each}