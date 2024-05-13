
<script lang="ts">
    import { settings } from "../../lib/network/settings";
    import SettingSection from "./_SettingSection.svelte";
    import SettingsToggle from "./_SettingsToggle.svelte";
    import SettingsDropdown from "./_SettingsDropdown.svelte";
    import Setting from "./_Setting.svelte";
    import { get_all_characters, type ICharacter } from "../../lib/network/characters";
    import ValidSetting from "./_ValidSetting.svelte";

    const SECTION_SUB_TEXT: string     = "Chat logging uses DLL injection, which is against the TOS of SWTOR and may result in a ban. Use at your own risk.";
    const UNIQUE_COLOR_SUBTEXT: string = `
        Our chat logging system is dependent upon chat channels having unique colors. To change a color, go in game, right click on a chat tab, select channel settings, 
        select a problematic channel and change the color, even slightly. Don't forget to click apply!
        `.trim();

    const EMOTE_COLOR_INDEX: number   = 2;
    const SAY_COLOR_INDEX: number     = 1;
    const YELL_COLOR_INDEX: number    = 0;
    const WHISPER_COLOR_INDEX: number = 3;


    let characters: ICharacter[] = [];
    get_all_characters((temp: ICharacter[]) => {

        characters = temp;
        decide_if_colors_are_unique();

    });

    let valid_emote_color: boolean   = false;
    let valid_say_color: boolean     = false;
    let valid_yell_color: boolean    = false;
    let valid_whisper_color: boolean = false;
    function decide_if_colors_are_unique() {

        if ($settings.chat_log.character_ini_to_pull_from == undefined) {
            return;
        }

        if (characters.length == 0) {
            return;
        }

        valid_emote_color   = is_color_unique(EMOTE_COLOR_INDEX);
        valid_say_color     = is_color_unique(SAY_COLOR_INDEX);
        valid_yell_color    = is_color_unique(YELL_COLOR_INDEX);
        valid_whisper_color = is_color_unique(WHISPER_COLOR_INDEX);

    }

    function is_color_unique(idx: number): boolean {

        let character_name = $settings.chat_log.character_ini_to_pull_from!;
        let character = characters.find((c) => c.character_name == character_name)!;
        return character.channel_colors.filter((c) => c.equals(character.channel_colors[idx])).length == 1;

    }

    $: if ($settings.chat_log.character_ini_to_pull_from) {
        decide_if_colors_are_unique();
    }

</script>

<SettingSection section="Chat Logging" sub_text={SECTION_SUB_TEXT}>
    <Setting setting="Select active character">
        <SettingsDropdown options={characters.map((c) => c.character_name)} bind:choosen_option={$settings.chat_log.character_ini_to_pull_from}></SettingsDropdown>
    </Setting>
    {#if $settings.chat_log.character_ini_to_pull_from}
        <Setting setting="Are chat colors unique?" sub_text={UNIQUE_COLOR_SUBTEXT}>
            <ValidSetting setting="/emote" valid={valid_emote_color}></ValidSetting>
            <ValidSetting setting="/say" valid={valid_say_color}></ValidSetting>
            <ValidSetting setting="/yell" valid={valid_yell_color}></ValidSetting>
            <ValidSetting setting="/whisper" valid={valid_whisper_color}></ValidSetting>
        </Setting>
    {/if}
    {#if valid_emote_color && valid_say_color && valid_yell_color && valid_whisper_color}
        <Setting setting="Enable Chat Logging">
            <SettingsToggle bind:checked={$settings.chat_log.capture_chat_log}></SettingsToggle>
        </Setting>
    {/if}
</SettingSection>