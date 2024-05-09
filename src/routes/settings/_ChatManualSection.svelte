
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";
</script>

<SettingSection section="Chat - Manual">
    <Setting setting="Confirm before posting">
        <SettingsToggle bind:checked={$settings.chat.confirmation_before_posting}></SettingsToggle>
    </Setting>
</SettingSection>