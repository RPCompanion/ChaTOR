
<script lang="ts">

    import watercolor from "../assets/watercolor-2.png";
    import FooterControls from "./_FooterControls.svelte";
    import Navbar from "./_Navbar.svelte";

</script>

<div class="flex flex-col min-h-screen bg-cover bg-no-repeat" style="background-image: url({watercolor})">
    <div class="flex-grow">
        <Navbar/>
        <slot></slot>
    </div>
    <FooterControls/>
</div>
