
<script lang="ts">

    import { onMount } from "svelte";
    import { init_network } from "../lib/network";
    import { goto } from "@roxi/routify";
    import { init_window_events } from "../lib/window";
    import { init_api } from "../lib/api";
    import { chator_check_latest_version } from "../lib/api/chator";

    onMount(async () => {

        init_network();
        init_window_events();
        init_api();

        await chator_check_latest_version();
    
        $goto("/automatic");

    });

</script>