
<script lang="ts">

    import { settings } from "../lib/network/settings";
    import watercolor from "../assets/watercolor-2.png";
    import FooterControls from "./_FooterControls.svelte";
    import Navbar from "./_Navbar.svelte";

</script>

<div class="flex flex-col min-h-screen bg-cover bg-no-repeat" style="background-image: url({watercolor}); opacity: {$settings.app.opacity/100.0}" >
    <div class="flex-grow">
        <Navbar/>
        <div class="">
            <slot></slot>
        </div>
    </div>
    <FooterControls/>
</div>

<style>
</style>