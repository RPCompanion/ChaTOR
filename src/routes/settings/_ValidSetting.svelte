
<script lang="ts">
    import { SealCheck, XCircle } from "phosphor-svelte";

    export let setting: string;
    export let valid: boolean;
</script>

<div class="flex flex-row gap-1">
    <div class="text-white">{setting}</div>
    <div>
        {#if valid}
            <SealCheck size={24} color="green" />
        {:else}
            <XCircle size={24} color="red" />
        {/if}
    </div>
</div>