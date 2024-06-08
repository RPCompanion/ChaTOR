
<script lang="ts">

    import { settings } from "../lib/network/settings";
    import NonDecoratedHeader from "./_NonDecoratedHeader.svelte";
    import FooterControls from "./_FooterControls.svelte";
    import Navbar from "./_Navbar.svelte";

</script>

<div 
    class="flex flex-col min-h-screen bg-cover bg-no-repeat"
    style="opacity: {$settings.app.show_window_decorations ? 1.0 : $settings.app.opacity/100.0}"
    class:border-x={!$settings.app.show_window_decorations}
    class:border-b={!$settings.app.show_window_decorations}
    class:border-slate-600={!$settings.app.show_window_decorations}
    class:background-img={$settings.app.show_background_image}
    class:bg-slate-800={!$settings.app.show_background_image}
    >
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

<style>
    .background-img {
        background-image: url("../assets//watercolor.webp");
    }

    .background-color {
        background-color: #205c89;
    }
</style>