
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import ChannelColorPickerModal from "../../components/_ChannelColorPickerModal.svelte";

    const PREFETCH_SUBTEXT = "Prevents delays in fetching item and achievements, at the cost of space and bandwidth";

    let show_channel_color_picker = false;
    function on_channel_colors_change() {
        show_channel_color_picker = true;
    }

</script>

{#if $settings.chat_log.capture_chat_log}
    <SettingSection section="Chat Log Window">
        <Setting setting="Show chat log window">
            <SettingsToggle bind:checked={$settings.chat_log.window.show_chat_log_window}></SettingsToggle>
        </Setting>
        {#if $settings.chat_log.window.show_chat_log_window}
            <Setting setting="Prefetch hyperlinks" sub_text={PREFETCH_SUBTEXT}>
                <SettingsToggle bind:checked={$settings.chat_log.window.prefetch_hyperlinks}></SettingsToggle>
            </Setting>
        {/if}
        <Setting setting="Set Channel Colors">
            <VariableSizeButton on:click={on_channel_colors_change}>Change</VariableSizeButton>
        </Setting>
    </SettingSection>
    <ChannelColorPickerModal bind:show={show_channel_color_picker}></ChannelColorPickerModal>
{/if}