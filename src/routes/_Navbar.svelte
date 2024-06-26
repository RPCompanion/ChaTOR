
<script lang="ts">

    import { trigger_navbar_callbacks, type INavbarSection } from "../lib/navbar/navbar";
    import { click_outside_handler } from "../lib/click_outside";
    import NavbarSection from "../lib/navbar/NavbarSection.svelte";
    import { settings, type ISettings } from "../lib/network/settings";

    let chat_section: INavbarSection;
    $: chat_section = get_chat_section($settings);

    const EMOTE_SECTION: INavbarSection = {
        name: "Emotes",
        elements: [
            {
                name: "Add/Edit Emotes",
                link: "/custom_emotes"
            },
            {
                name: "Emote Board",
                link: "/emote_board"
            }
        ]
    };
    
    const SETTINGS_SECTION: INavbarSection = {
        name: "Settings",
        link: "/settings"
    };

    const ROLEPLAY_SECTION: INavbarSection = {
        name: "Roleplay",
        elements: [
            {
                name: "Star Forge Beacons",
                link: "/star_forge_beacons"
            }
        ]
    }

    function get_chat_section(settings: ISettings): INavbarSection {

        let chat_section: INavbarSection = {
            name: "Chat",
            elements: [
                {
                    name: "Manual",
                    link: "/manual"
                },
                {
                    name: "Automatic",
                    link: "/automatic"
                }
            ]
        };

        if (settings.chat_log.capture_chat_log) {
            
            chat_section.elements?.push({
                name: "Log Viewer",
                link: "/log_viewer"
            });

            chat_section.elements?.push({
                name: "Add/Edit Custom Channels",
                link: "/custom_channels"
            })

        }

        return chat_section;

    }

</script>

<div class="w-full h-12 bg-slate-700 relative shadow-md grid grid-cols-2 z-10" use:click_outside_handler={trigger_navbar_callbacks}>
    <div class="flex flex-row gap-2">
        <NavbarSection section={chat_section}/>
        <NavbarSection section={EMOTE_SECTION}/>
        <NavbarSection section={ROLEPLAY_SECTION}/>
    </div>
    <div class="flex flex-row-reverse">
        <NavbarSection section={SETTINGS_SECTION}/>
    </div>
</div>

