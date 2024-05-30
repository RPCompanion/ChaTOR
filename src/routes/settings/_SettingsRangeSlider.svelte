
<script lang="ts">

    import { createEventDispatcher } from "svelte";

    export let value: string;
    export let min: number;
    export let max: number;

    const dispatch = createEventDispatcher();
    function on_change() {
        dispatch("value_change", value);
    }

</script>

<div class="">
    <input type="range" bind:value={value} min={min.toString()} max={max.toString()} on:change={on_change} class="w-full cursor-pointer"/>
    <div class="flex justify-between text-white text-xl">
        <span>{min}%</span>
        <span>{max}%</span>
    </div>
</div>