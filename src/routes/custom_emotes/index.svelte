
<script lang="ts">

    import EmoteContainer from "./_EmoteContainer.svelte";
    import { custom_emotes } from "../../lib/network/custom_emote";
    import EmoteModal from "./_EmoteModal.svelte";

    let show_modal = false;
    let emotes: any = $custom_emotes;

    let scroll_bottom: boolean = false;

    set_emote_ids();

    function on_cancel_modal() {
        show_modal = false;
    }

    function on_save_modal() {
        show_modal = false;
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

</script>

<div class="h-12"></div>
<div class="w-full relative">
    <div>
        <div class="h-2"></div>
        {#if $custom_emotes.filter((e) => e.favourite).length > 0}
            <p class="text-white text-2xl text-center">Favourite Emotes</p>
            <div class="h-2"></div>
        {/if}
        <EmoteContainer emotes={$custom_emotes} favourite={true}/>

        {#if $custom_emotes.filter((e) => !e.favourite).length > 0 && $custom_emotes.filter((e) => e.favourite).length > 0}
            <div class="h-1"></div>
            <p class="text-white text-2xl text-center">Emotes</p>
            <div class="h-2"></div>
        {/if}
        <EmoteContainer emotes={$custom_emotes} favourite={false}/>
    </div>
    <div class="h-6"></div>
    <div class="flex flex-row justify-center">
        <button class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={() => { show_modal = true; }}>New Emote</button>
    </div>
    <EmoteModal {show_modal} on:save={on_save_modal} on:cancel={on_cancel_modal}/>
</div>