

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import VariableSizeButton from "../../../lib/buttons/VariableSizeButton.svelte";
    
    const dispatch = createEventDispatcher();

    function on_submit() {

    }

    function on_back() {
        dispatch("back");
    }
</script>

<VariableSizeButton on:click={on_back}>Back</VariableSizeButton>
<VariableSizeButton on:click={on_submit}>Submit</VariableSizeButton>