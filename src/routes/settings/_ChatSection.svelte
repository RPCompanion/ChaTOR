
<script lang="ts">
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";

    import { settings } from "../../lib/network/settings";

</script>

<SettingSection section="Chat">

    <Setting setting="Clear chat after posting">
        <SettingsToggle bind:checked={$settings.chat.clear_chat_after_posting}></SettingsToggle>
    </Setting>
    {#if $settings.chat_log.capture_chat_log}
        <Setting setting="Show chat log">
            <SettingsToggle bind:checked={$settings.chat.show_chat_log_window}></SettingsToggle>
        </Setting>
        <Setting setting="Retry submitting unprocessed posts">
            <SettingsToggle bind:checked={$settings.chat.retry_message_submission}></SettingsToggle>
        </Setting>
    {/if}
    
</SettingSection>