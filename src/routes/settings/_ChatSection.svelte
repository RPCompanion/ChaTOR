
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
    
</SettingSection>