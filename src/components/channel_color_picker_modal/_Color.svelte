
<script lang="ts">

    import type { IColor } from "../../lib/network/character_colors";
    import ColorPicker from 'svelte-awesome-color-picker';

    export let text: string;
    export let color: IColor;

    // IColor but with alpha
    let a_color = {
        r: color.r,
        g: color.g,
        b: color.b,
        a: 1
    }

    $: color = {
        r: a_color.r,
        g: a_color.g,
        b: a_color.b
    }

</script>

<div class="grid grid-cols-2">
    <p class="text-white">{text}</p>
    <ColorPicker isAlpha={false} bind:rgb={a_color} label={""}></ColorPicker>
</div>