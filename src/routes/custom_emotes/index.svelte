
<script lang="ts">

    import { fade } from "svelte/transition";
    import XButton from "../../lib/buttons/XButton.svelte";
    import { custom_emotes, delete_custom_emote, update_custom_emote } from "../../lib/network/custom_emote";
    import EmoteModal from "./_EmoteModal.svelte";

    let show_modal = false;
    let show_x_button_idx: number | undefined = undefined;

    function on_cancel_modal() {
        show_modal = false;
    }

</script>

<div class="h-12"></div>
<div class="w-full relative">
    <div class="flex flex-col gap-2 max-h-96 overflow-y-auto">
        {#each $custom_emotes as emote, idx}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <div class="flex flex-row gap-2 px-2 relative" on:mouseenter={() => { show_x_button_idx = idx }} on:mouseleave={() => { show_x_button_idx = undefined }}>
                <input type="text" bind:value={emote.emote_name} class="w-1/2 text-xl outline-none border-slate-500 border-2 rounded-md px-1" on:focusout={() =>  { update_custom_emote(emote); }}/>
                <input type="text" bind:value={emote.emote} class="w-1/2 text-xl outline-none border-slate-500 border-2 rounded-md px-1" on:focusout={() => { update_custom_emote(emote); }} />
                {#if show_x_button_idx == idx}
                    <div class="absolute right-0 bottom-3" transition:fade|local={{ duration: 150 }}>
                        <XButton on:click={() => { delete_custom_emote(emote.custom_emote_id); }}/>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    <div class="h-6"></div>
    <div class="flex flex-row justify-center">
        <button class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={() => { show_modal = true; }}>New Emote</button>
    </div>
    <EmoteModal {show_modal} on:cancel={on_cancel_modal}/>
</div>