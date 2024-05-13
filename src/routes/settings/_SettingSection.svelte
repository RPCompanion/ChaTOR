
<script lang="ts">
   export let section: string;
   export let sub_text: string | undefined = undefined;
</script>

<div class="w-full">
    <div class="text-xl text-white"><b>{section}</b></div>
    {#if sub_text}
        <div class="text-sm text-gray-400">{sub_text}</div>
    {/if}
    <div class="w-full pl-6">
        <slot/>
    </div>
</div>