
<script lang="ts">

    import { fade } from "svelte/transition";
    import { computePosition, type Side } from "@floating-ui/dom";

    export let tooltip_text: string;
    export let placement: Side; 

    let elem:    HTMLElement;
    let tooltip: HTMLElement;
    let show_tool_tip: boolean = false;

    let x_offset: number = get_x_offset();
    let y_offset: number = get_y_offset();

    function get_x_offset(): number {

        if (placement === "right") {
            return 5;
        } else if (placement === "left") {
            return -5;
        }

        return 0;

    }

    function get_y_offset(): number {

        if (placement === "top") {
            return -5;
        } else if (placement === "bottom") {
            return 5;
        }

        return 0;

    }

    function compute_position() {

        computePosition(elem, tooltip, { placement })
            .then(({x, y}) => {
                tooltip.style.left = `${x + x_offset}px`;
                tooltip.style.top  = `${y + y_offset}px`;
            });

    }

    function show() {

        show_tool_tip = true;
        setTimeout(() => {
            compute_position();
        }, 1)

    }

    function hide() {

        show_tool_tip = false;

    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={elem} on:mouseenter={show} on:mouseleave={hide}>
    <slot></slot>
</div>
{#if show_tool_tip}
    <div
        transition:fade|local="{{duration: 500}}"
        bind:this={tooltip} 
        class="text-white text-lg absolute bg-slate-600 rounded-md px-2">{tooltip_text}
    </div>
{/if}