
<script lang="ts">
    import { settings } from "../lib/network/settings";
    export let title: string | undefined = undefined;
</script>

<div class="p-10 relative">
    {#if title != undefined && $settings.app.show_page_header}
        <div class="text-white text-2xl text-center bg-slate-600 select-none">{title}</div>
        <div class="h-8"></div>
    {/if}
    <slot></slot>
</div>