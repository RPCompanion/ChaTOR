
<script lang="ts">

    import { afterUpdate } from "svelte";
    import { flip } from "svelte/animate";
    import { dndzone } from 'svelte-dnd-action';

    import { fade } from "svelte/transition";
    import XButton from "../../lib/buttons/XButton.svelte";
    import { custom_emotes, delete_custom_emote, update_custom_emote } from "../../lib/network/custom_emote";
    import EmoteModal from "./_EmoteModal.svelte";

    let show_modal = false;
    let show_x_button_idx: number | undefined = undefined;
    let emotes: any = $custom_emotes;

    let scroll_bottom: boolean = false;
    let emote_section: HTMLElement;

    set_emote_ids();

    function on_cancel_modal() {
        show_modal = false;
    }

    function on_save_modal() {
        show_modal = false;
    }

    function handle_dnd_consider(e: any) {
        emotes = e.detail.items;
    }

    function handle_dnd_finalize(e: any) {
        emotes = e.detail.items;
        $custom_emotes = emotes;
    }

    function set_emote_ids() {

        emotes.forEach((emote: any) => {
            emote.id = emote.custom_emote_id;
        });

    }

    $: if ($custom_emotes.length != emotes.length) {

        if ($custom_emotes.length > emotes.length) {
            scroll_bottom = true;
        }

        emotes = $custom_emotes;
        set_emote_ids();

    }

    afterUpdate(() => {

        if (scroll_bottom) {
            const last_emote = emote_section.lastElementChild;
            if (last_emote) {
                last_emote.scrollIntoView({ behavior: "smooth" });
            }
            scroll_bottom = false;
        }

    });

</script>

<div class="h-12"></div>
<div class="w-full relative">
    <section class="flex flex-col gap-2 max-h-96 overflow-y-auto" bind:this={emote_section} use:dndzone="{{items: emotes, flipDurationMs: 300}}" on:consider={handle_dnd_consider} on:finalize={handle_dnd_finalize}>
        {#each emotes as emote (emote.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <div animate:flip="{{ duration: 300 }}" class="flex flex-row gap-2 px-2 relative" on:mouseenter={() => { show_x_button_idx = emote.id }} on:mouseleave={() => { show_x_button_idx = undefined }}>
                <input type="text" bind:value={emote.emote_name} class="w-1/2 text-xl outline-none border-slate-500 border-2 rounded-md px-1" on:focusout={() =>  { update_custom_emote(emote); }}/>
                <input type="text" bind:value={emote.emote} class="w-1/2 text-xl outline-none border-slate-500 border-2 rounded-md px-1" on:focusout={() => { update_custom_emote(emote); }} />
                {#if show_x_button_idx == emote.id}
                    <div class="absolute right-0 bottom-3" transition:fade|local={{ duration: 150 }}>
                        <XButton on:click={() => { delete_custom_emote(emote.custom_emote_id); }}/>
                    </div>
                {/if}
            </div>
        {/each}
    </section>
    <div class="h-6"></div>
    <div class="flex flex-row justify-center">
        <button class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={() => { show_modal = true; }}>New Emote</button>
    </div>
    <EmoteModal {show_modal} on:save={on_save_modal} on:cancel={on_cancel_modal}/>
</div>