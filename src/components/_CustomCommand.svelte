
<script lang="ts">
    
    import { ESwtorChannel } from "../lib/network/swtor_channel";
    import { active_chat_tab_index } from "../lib/chat_log_window/chat_log_window_store";
    import { custom_channels } from "../lib/network/custom_channels";
    import { settings, type ChannelDispatcher } from "../lib/network/settings";

    let channels: string[] = Object.keys(ESwtorChannel)
        .filter((key) => isNaN(Number(key)))
        .filter((key) => key != "WHISPER" && key != "CUSTOM_CHANNEL");

    let value: number | string | undefined = undefined
    $: $active_chat_tab_index, set_value();
    $: value, set_settings();

    function get_channel_number(channel: string): number {
        return ESwtorChannel[channel as keyof typeof ESwtorChannel]
    }

    function set_value() {

        let default_channel = $settings.chat_log.window.chat_tabs[$active_chat_tab_index].default_channel;

        if (default_channel == undefined) {

            value = undefined;
            return;

        }

        if ("RegularDispatch" in default_channel) {
            value = default_channel.RegularDispatch
        } else {
            value = default_channel.CustomDispatch
        }

    }

    function set_settings() {

        if (value == undefined) {
            return;
        }

        if (typeof value == "number") {
            $settings.chat_log.window.chat_tabs[$active_chat_tab_index].default_channel = { RegularDispatch: value };
        } else {
            $settings.chat_log.window.chat_tabs[$active_chat_tab_index].default_channel = { CustomDispatch: value };
        }

    }

    set_value();

</script>

<div>
    <select 
        bind:value={value}
        class="rounded-md outline-none border-none bg-slate-600 text-white px-1 select-none">
        <option value={undefined}>none</option>
        {#each channels as channel}
            <option value={get_channel_number(channel)}>{channel.toLowerCase().replace("_", " ")}</option>
        {/each}
        <hr/>
        {#each $custom_channels as channel}
            <option value={channel.channel_name}>{channel.channel_name.toLowerCase()}</option>
        {/each}
    </select>
</div>
