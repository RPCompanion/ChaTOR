
<script lang="ts">
    import { active_character } from "./network/characters";
    import { createEventDispatcher } from "svelte";
    import { SwtorMessage, swtor_messages } from "./network/swtor_message";
    import { afterUpdate } from "svelte";
    import Checkbox from "./Checkbox.svelte";
    import { Channel, ChannelType } from "./network/swtor_channel";

    let auto_scroll: boolean = true;
    let container: HTMLElement | undefined = undefined;
    let last_message: HTMLElement | undefined = undefined;
    const dispatch = createEventDispatcher();

    function on_character_click(message: SwtorMessage) {

        if (message.channel.type == ChannelType.WHISPER && message.from == $active_character?.character_name) {
            dispatch("whisper", { character_name: message.to });
            return;
        }

        dispatch("whisper", { character_name: message.from });
    }

    function scroll_container() {

        if (last_message == undefined) {
            return;
        }

        if (!auto_scroll) {
            return;
        }

        last_message.scrollIntoView({ behavior: "smooth", block: "end" });

    }

    afterUpdate(() => {
        scroll_container();
    });

    let relevant_messages: SwtorMessage[] = [];
    $: relevant_messages = $swtor_messages.filter((message) => {
        return message.channel.type == ChannelType.EMOTE || message.channel.type == ChannelType.SAY || message.channel.type == ChannelType.YELL || message.channel.type == ChannelType.WHISPER;
    });

</script>

<div class="w-full">
    <Checkbox bind:checked={auto_scroll} size="small">Auto scroll</Checkbox>
</div>
<div bind:this={container} class="flex flex-col h-44 max-h-96 resize-y  rounded-md border-2 border-slate-700 overflow-y-auto chat-container-background">
    {#each relevant_messages as message}

        <div bind:this={last_message} class="w-full opacity-100">

            <span class="text-white">[{message.timestamp}]</span>

            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="text-slate-200 cursor-pointer" on:click={() => {on_character_click(message)}}>
                {#if message.from == $active_character?.character_name && message.channel.type == ChannelType.WHISPER}
                    [to {message.to}]:
                {:else}
                    {message.from}:
                {/if}
            </span>
            <span class="" style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{message.message}</span>
        </div>

    {/each}
</div>

<style>

</style>