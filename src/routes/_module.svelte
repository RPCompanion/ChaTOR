
<script lang="ts">

    import { settings } from "../lib/network/settings";
    import NonDecoratedHeader from "./_NonDecoratedHeader.svelte";
    import watercolor from "../assets/watercolor-2.png";
    import FooterControls from "./_FooterControls.svelte";
    import Navbar from "./_Navbar.svelte";

</script>

<div class="flex flex-col min-h-screen bg-cover bg-no-repeat" style="background-image: url({watercolor}); opacity: {$settings.app.opacity/100.0}" >
    {#if !$settings.app.show_window_decorations}
        <NonDecoratedHeader/>
        <div class="h-8"></div>
    {/if}
    <div class="flex-grow">
        <Navbar/>
        <slot></slot>
    </div>
    <FooterControls/>
</div>