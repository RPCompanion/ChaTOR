
<script lang="ts">
    export let setting: string;
    export let sub_text: string | undefined = undefined;
</script>

<div class="grid grid-cols-2 w-full">
    <div class="flex flex-col">
        <div class="text-xl text-white">{setting}</div>
        {#if sub_text}
            <div class="text-sm text-gray-400">{sub_text}</div>
        {/if}
    </div>
    <div>
        <slot></slot>
    </div>
</div>