
<script lang="ts">

    export let value: number;
    export let min: number;
    export let max: number;

</script>

<div class="">
    <input type="range" bind:value={value} min={min} max={max} class="w-full cursor-pointer"/>
    <div class="flex justify-between text-white text-xl">
        <span>{min}%</span>
        <span>{max}%</span>
    </div>
</div>