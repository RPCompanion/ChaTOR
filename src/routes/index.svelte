
<script lang="ts">

    import { init_network } from "../lib/network";
    import { goto } from "@roxi/routify";

    init_network();
    $goto("/automatic");

</script>