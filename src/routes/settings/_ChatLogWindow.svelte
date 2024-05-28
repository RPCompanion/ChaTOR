
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";
</script>

{#if $settings.chat_log.capture_chat_log}
    <SettingSection section="Chat Log Window">
        <Setting setting="Show chat log window">
            <SettingsToggle bind:checked={$settings.chat_log.window.show_chat_log_window}></SettingsToggle>
        </Setting>
        <Setting setting="Show unknown ids">
            <SettingsToggle bind:checked={$settings.chat_log.window.show_unknown_ids}></SettingsToggle>
        </Setting>
    </SettingSection>
{/if}