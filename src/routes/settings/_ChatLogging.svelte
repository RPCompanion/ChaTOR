
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import SettingsDropdown from "./_SettingsDropdown.svelte";
    import { Result } from "../../lib/result";
    import Setting from "./_Setting.svelte";
    import { shown_characters_error } from "./settings";
    import { toast_error } from "../../lib/utils";

    import { 
        get_all_character_colors, 
        type ICharacterColorInfo
    } from "../../lib/network/character_colors";

    const SECTION_SUB_TEXT: string = "Chat logging uses DLL injection, which is against the TOS of SWTOR and may result in a ban. Use at your own risk.";

    let characters: ICharacterColorInfo[] = [];
    function init_all_characters() {

        get_all_character_colors((temp: Result<ICharacterColorInfo[], string>) => {

            if (temp.is_ok()) {
                characters = temp.unwrap();
                return;
            }

            if ($shown_characters_error) {
                return;
            }

            $shown_characters_error = true;
            toast_error(temp.unwrap_err());

        });
        
    }

    init_all_characters();

</script>

<SettingSection section="Chat Logging" sub_text={SECTION_SUB_TEXT}>
    <Setting setting="Select active character">
        <SettingsDropdown options={characters.map((c) => c.character_name)} bind:choosen_option={$settings.chat_log.character_ini_to_pull_from}></SettingsDropdown>
    </Setting>
    {#if $settings.chat_log.character_ini_to_pull_from != undefined}
        <Setting setting="Enable Chat Logging">
            <SettingsToggle bind:checked={$settings.chat_log.capture_chat_log}></SettingsToggle>
        </Setting>
    {/if}
    {#if $settings.chat_log.capture_chat_log}
        <Setting setting="Log Global Chat" sub_text="Logging for the global, trade and pvp channels">
            <SettingsToggle bind:checked={$settings.chat_log.log_global_chat}></SettingsToggle>
        </Setting>
        <Setting setting="Retry submitting unprocessed posts">
            <SettingsToggle bind:checked={$settings.chat_log.retry_message_submission}></SettingsToggle>
        </Setting>
    {/if}
</SettingSection>