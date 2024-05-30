
<script lang="ts">

    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import SettingsRangeSlider from "./_SettingsRangeSlider.svelte";
    import Setting from "./_Setting.svelte";

    function on_value_change(event: CustomEvent<number>) {
        console.log(typeof event.detail);
    }

</script>

<SettingSection section="App Settings">
    <Setting setting="Show window decorations" sub_text="Disable setting for a more seamless looking window">
        <SettingsToggle bind:checked={$settings.app.show_window_decorations}></SettingsToggle>
    </Setting>
    <Setting setting="Window Opacity">
        <SettingsRangeSlider bind:value={($settings.app.opacity)} max={100} min={50} on:value_change={on_value_change} />
    </Setting>
</SettingSection>