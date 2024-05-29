
<script lang="ts">

    import { init_network } from "../lib/network";
    import { goto } from "@roxi/routify";
    import { init_window_events } from "../lib/window";

    init_network();
    init_window_events();
    $goto("/automatic");

</script>