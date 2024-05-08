
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

</script>

<div class="w-full h-12 bg-slate-700 relative shadow-md grid grid-cols-2 z-10">
    <div class="flex flex-row gap-2">
        <NavbarSection section={CHAT_SECTION}/>
    </div>
    <div>

    </div>
</div>

