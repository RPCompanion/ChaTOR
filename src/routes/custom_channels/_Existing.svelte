
<script lang="ts">
    import { custom_channels } from "../../lib/network/custom_channels";
    import { deep_copy } from "../../lib/utils";
    import ExistingElem from "./_ExistingElem.svelte";
</script>

<div class="h-4"></div>
{#each $custom_channels as channel}
    <ExistingElem channel={deep_copy(channel)} />
{/each}