
<script lang="ts">

    import { type INavbarSection } from "../lib/navbar/navbar";
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
        name: "Custom Emotes",
        link: "/custom_emotes"
    };
    
    const SETTINGS_SECTION: INavbarSection = {
        name: "Settings",
        link: "/settings"
    };

</script>

<div class="w-full h-12 bg-slate-700 relative shadow-md grid grid-cols-2 z-10">
    <div class="flex flex-row gap-2">
        <NavbarSection section={CHAT_SECTION}/>
        <NavbarSection section={EMOTE_SECTION}/>
    </div>
    <div class="flex flex-row-reverse">
        <NavbarSection section={SETTINGS_SECTION}/>
    </div>
</div>

