
<script lang="ts">
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import Setting from "./_Setting.svelte";

    import { settings } from "../../lib/network/settings";

</script>

<SettingSection section="Chat">

    <Setting setting="Confirm before posting">
        <SettingsToggle bind:checked={$settings.chat.confirmation_before_posting}></SettingsToggle>
    </Setting>

    <Setting setting="Press enter to send">
        <SettingsToggle bind:checked={$settings.chat.enter_to_post}></SettingsToggle>
    </Setting>

    <Setting setting="Clear chat after posting">
        <SettingsToggle bind:checked={$settings.chat.clear_chat_after_posting}></SettingsToggle>
    </Setting>

</SettingSection>