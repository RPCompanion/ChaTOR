
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
    <Setting setting="Show background image">
        <SettingsToggle bind:checked={$settings.app.show_background_image}></SettingsToggle>
    </Setting>
    <Setting setting="Show window decorations" sub_text="Disable setting for a more seamless looking window.">
        <SettingsToggle bind:checked={$settings.app.show_window_decorations}></SettingsToggle>
    </Setting>
    {#if !$settings.app.show_window_decorations}
        <Setting setting="Window Opacity">
            <SettingsRangeSlider bind:value={($settings.app.opacity)} max={100} min={60} on:value_change={on_value_change} />
        </Setting>
    {/if}
    <Setting setting="Show page headers" sub_text="For a more minimalist look">
        <SettingsToggle bind:checked={$settings.app.show_page_header}></SettingsToggle>
    </Setting>
</SettingSection>