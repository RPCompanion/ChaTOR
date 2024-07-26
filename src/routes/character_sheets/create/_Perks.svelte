
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    
    const dispatch = createEventDispatcher();

    function on_next() {

    }

    function on_back() {
        dispatch("back");
    }

</script>

<div class="flex flex-col gap-2">

    <div class="flex flex-row gap-2 justify-center">
        <VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
        <VariableSizeButton on:click={on_next}>Next</VariableSizeButton>
    </div>

</div>