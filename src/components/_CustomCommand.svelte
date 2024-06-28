
<script lang="ts">
    
    import { ESwtorChannel } from "../lib/network/swtor_channel";
    import { active_chat_tab_index } from "../lib/chat_log_window/chat_log_window_store";
    import { settings } from "../lib/network/settings";

    let channels: string[] = Object.keys(ESwtorChannel)
        .filter((key) => isNaN(Number(key)))
        .filter((key) => key != "WHISPER" && key != "CUSTOM_CHANNEL");

    function get_value(channel: string): number {

        return ESwtorChannel[channel as keyof typeof ESwtorChannel]

    }

</script>

<div>
    <select 
        bind:value={$settings.chat_log.window.chat_tabs[$active_chat_tab_index].default_channel}
        class="rounded-md outline-none border-none bg-slate-600 text-white px-1 select-none">
        <option value={undefined}>none</option>
        {#each channels as channel}
            <option value={get_value(channel)}>{channel.toLowerCase().replace("_", " ")}</option>
        {/each}
    </select>
</div>
