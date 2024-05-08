
<script lang="ts">

    import watercolor from "../assets/watercolor-2.png";
    import FooterControls from "./_FooterControls.svelte";
    import Navbar from "./_Navbar.svelte";

</script>

<img src={watercolor} alt="background-watercolor" class="absolute inset-0 w-full h-full object-fill z-0"/>
<div class="flex flex-col min-h-screen">
    <div class="flex-grow">
        <Navbar/>
        <slot></slot>
    </div>
    <FooterControls/>
</div>
