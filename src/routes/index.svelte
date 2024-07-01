
<script lang="ts">

    import { onMount } from "svelte";
    import { init_network } from "../lib/network";
    import { goto } from "@roxi/routify";
    import { init_window_events } from "../lib/window";

    onMount(() => {
        init_network();
        init_window_events();
        $goto("/automatic");
    })

</script>