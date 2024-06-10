
<script lang="ts">
    export let title: string | undefined = undefined;
</script>

<div class="p-10 relative">
    {#if title != undefined}
        <div class="text-white text-2xl text-center bg-slate-600">{title}</div>
        <div class="h-8"></div>
    {/if}
    <slot></slot>
</div>