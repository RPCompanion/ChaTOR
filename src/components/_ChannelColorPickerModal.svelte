
<script lang="ts">

    import { fly } from "svelte/transition";
    import XButton from "../lib/buttons/XButton.svelte";
    import { settings } from "../lib/network/settings";
    import Color from "./channel_color_picker_modal/_Color.svelte";
    
    export let show = false;

    function close() {
        show = false;
    }

</script>

{#if show}
    <div transition:fly|local={{ duration: 500, y: -500 }} class="fixed p-1 center w-52 bg-slate-500 rounded-md border border-slate-700 z-10">
        <div class="flex flex-row gap-1">
            <h1 class="text-white text-xl">Channel Colors</h1>
            <div class="relative left-8">
                <XButton on:click={close}></XButton>
            </div>
        </div>
        <Color text="Say" bind:color={$settings.chat_log.window.channel_colors.say}/>
        <Color text="Yell" bind:color={$settings.chat_log.window.channel_colors.yell}/>
        <Color text="Emote" bind:color={$settings.chat_log.window.channel_colors.emote}/>
        <Color text="Whisper" bind:color={$settings.chat_log.window.channel_colors.whisper}/>
        <Color text="Group" bind:color={$settings.chat_log.window.channel_colors.group}/>
        <Color text="Guild" bind:color={$settings.chat_log.window.channel_colors.guild}/>
        <Color text="Ops" bind:color={$settings.chat_log.window.channel_colors.ops}/>
        <Color text="Ops Leader" bind:color={$settings.chat_log.window.channel_colors.ops_leader}/>
        <div class="h-6"></div>
    </div>
{/if}

<style>
    .center {
        left: calc(50% - 13rem/2);
    }
</style>