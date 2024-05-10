
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
    <Setting setting="Remove starting pronouns in a post">
        <SettingsToggle bind:checked={$settings.chat.remove_starting_pronouns}></SettingsToggle>
    </Setting>
    <Setting setting="Set the first character of a post to it's lowercase equivalent">
        <SettingsToggle bind:checked={$settings.chat.starting_characters_are_lowercase}></SettingsToggle>
    </Setting>
</SettingSection>