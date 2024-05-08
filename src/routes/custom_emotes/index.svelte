
<script lang="ts">

    import { custom_emotes } from "../../lib/com/custom_emote";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import EmoteModal from "./_EmoteModal.svelte";

    let show_modal = false;

    function on_cancel_modal() {
        show_modal = false;
    }

</script>

<div>
    {#each $custom_emotes as emote}
        <div class="flex flex-row">
            <input type="text" value={emote.emote_name} class="w-1/2"/>
            <input type="text" value={emote.emote} class="w-1/2"/>
        </div>
    {/each}
    <button class="bg-slate-700 text-white text-xl px-2 rounded-md" on:click={() => { show_modal = true; }}>New Emote</button>
    <EmoteModal {show_modal} on:cancel={on_cancel_modal}/>
</div>