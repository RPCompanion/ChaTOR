

<script lang="ts">
    
    import { custom_channels } from "../../lib/network/custom_channels";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import AddModal from "./_AddModal.svelte";

    let show_modal = false;

    function add_new() {

        show_modal = true;

    }

    function on_modal_cancel() {

        show_modal = false;

    }

</script>

{#if $custom_channels.length < 7}

    {#if $custom_channels.length == 0}
        <div class="h-52"></div>
    {:else}
        <div class="h-4"></div>
    {/if}
    
    <div class="w-full flex flex-row justify-center">
        <VariableSizeButton on:click={add_new}>Add New</VariableSizeButton>
    </div>

{/if}

{#if show_modal}
    <AddModal on:cancel={on_modal_cancel}/>
{/if}