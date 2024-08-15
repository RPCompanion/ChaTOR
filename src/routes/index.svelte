
<script lang="ts">

    import { onMount } from "svelte";
    import { init_network } from "../lib/network";
    import { goto } from "@roxi/routify";
    import { init_window_events } from "../lib/window";
    import { init_api } from "../lib/api";

    onMount(() => {
        init_network();
        init_window_events();
        init_api();
        $goto("/automatic");
    });

</script>