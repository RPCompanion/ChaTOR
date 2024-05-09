
<script lang="ts">

    import { settings } from "../../lib/network/settings";
    export let checked: boolean;

</script>

<input type="checkbox" bind:checked={checked} on:change={() => { $settings = $settings }} class="scale-150" />