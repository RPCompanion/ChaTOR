
<script lang="ts">
   export let section: string; 
</script>

<div class="w-full">
    <div class="text-xl"><b>{section}</b></div>
    <div class="w-full pl-6">
        <slot/>
    </div>
    <div class="border border-slate-600"></div>
</div>