
<script lang="ts">

    import { type INavbarSection } from "../lib/navbar/navbar";
    import { trigger_navbar_callbacks } from "../lib/navbar/navbar";
    import { click_outside_handler } from "../lib/click_outside";
    import NavbarSection from "../lib/navbar/NavbarSection.svelte";

    const CHAT_SECTION: INavbarSection = {
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

</script>

<div class="w-full h-12 bg-slate-700 relative shadow-md grid grid-cols-2 z-10" use:click_outside_handler on:click_outside={trigger_navbar_callbacks}>
    <div class="flex flex-row gap-2">
        <NavbarSection section={CHAT_SECTION}/>
        <NavbarSection section={EMOTE_SECTION}/>
    </div>
    <div class="flex flex-row-reverse">
        <NavbarSection section={SETTINGS_SECTION}/>
    </div>
</div>

