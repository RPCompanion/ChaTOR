
<script lang="ts">

    import { afterUpdate } from "svelte";
    import { dndzone } from 'svelte-dnd-action';

    import Emote from "./_Emote.svelte";
    import { custom_emotes } from "../../lib/network/custom_emote";
    import EmoteModal from "./_EmoteModal.svelte";

    let show_modal = false;
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
    <section bind:this={emote_section} class="flex flex-col gap-2 max-h-96 overflow-y-auto">

        <div class="h-2"></div>
        {#if $custom_emotes.filter((e) => e.favourite).length > 0}
            <p class="text-white text-2xl text-center">Favourite Emotes</p>
        {/if}
        {#each $custom_emotes.filter((e) => e.favourite).sort((a, b) => a.order_index - b.order_index) as emote}
            <Emote {emote} favourite={true}/>
        {/each}

        
        {#if $custom_emotes.filter((e) => !e.favourite).length > 0 && $custom_emotes.filter((e) => e.favourite).length > 0}
            <div class="h-1"></div>
            <p class="text-white text-2xl text-center">Emotes</p>
        {/if}
        {#each $custom_emotes.filter((e) => !e.favourite).sort((a, b) => a.order_index - b.order_index) as emote}
            <Emote {emote} favourite={false}/>
        {/each}

    </section>
    <div class="h-6"></div>
    <div class="flex flex-row justify-center">
        <button class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={() => { show_modal = true; }}>New Emote</button>
    </div>
    <EmoteModal {show_modal} on:save={on_save_modal} on:cancel={on_cancel_modal}/>
</div>