
<script lang="ts">

    import { init_hook } from "../lib/network";
    import { goto } from "@roxi/routify";

    init_hook();
    $goto("/manual");

</script>