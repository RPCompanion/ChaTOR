
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";
</script>

<SettingSection section="Chat - Automatic">
    <Setting setting="Press enter to post">
        <SettingsToggle bind:checked={$settings.chat.enter_to_post}></SettingsToggle>
    </Setting>
</SettingSection>