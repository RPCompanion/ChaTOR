
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { save_date_tag, type IDateTag } from "../../lib/network/datetags";
    import Checkbox from "../../lib/Checkbox.svelte";
 
    export let date_tag: IDateTag | undefined = undefined;

    const dispatch = createEventDispatcher();
    function on_checked(e: CustomEvent<boolean>) {

        save_date_tag(date_tag!);
        dispatch("change", date_tag!);

    }

</script>

{#if date_tag != undefined}
    <Checkbox bind:checked={date_tag.favourite} on:checked={on_checked}>
        Favourite
    </Checkbox>
{/if}