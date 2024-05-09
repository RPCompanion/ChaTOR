
<script lang="ts">
   export let section: string; 
</script>

<div class="w-full">
    <div class="text-xl text-white"><b>{section}</b></div>
    <div class="w-full pl-6">
        <slot/>
    </div>
    <div class="border border-gray-200"></div>
</div>