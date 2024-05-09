
<script lang="ts">
    export let setting: string;
</script>

<div class="grid grid-cols-2 w-full">
    <div>
        <div class="text-xl text-white">{setting}</div>
    </div>
    <div>
        <slot></slot>
    </div>
</div>