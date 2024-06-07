
<script lang="ts">

    import { DotsSix, Star } from "phosphor-svelte";
    import { fade } from "svelte/transition";
    import { dragHandle } from "svelte-dnd-action";
    import XButton from "../../lib/buttons/XButton.svelte";
    import type { ICustomEmote } from "../../lib/network/custom_emote";
    import { update_custom_emote, delete_custom_emote, get_next_order_index } from "../../lib/network/custom_emote";
    
    export let emote: ICustomEmote
    export let favourite: boolean = false;

    let show_other_buttons: boolean = false;

    function toggle_favourite() {
        emote.favourite   = !emote.favourite;
        emote.order_index = get_next_order_index(emote.favourite);
        update_custom_emote(emote);
    }

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="flex flex-row gap-2 px-2 relative" on:mouseenter={() => { show_other_buttons = true}} on:mouseleave={() => { show_other_buttons = false }}>
    <input type="text" 
        bind:value={emote.emote_name} 
        class="w-1/2 text-xl outline-none border-2 rounded-md px-1"
        class:border-slate-500={!favourite}
        class:border-yellow-500={favourite}
        on:focusout={() =>  { update_custom_emote(emote); }}
    />
    <div use:dragHandle class="text-white">
        <DotsSix size={24} />
    </div>
    <input 
        type="text" 
        bind:value={emote.emote} 
        class="w-1/2 text-xl outline-none border-2 rounded-md px-1"
        class:border-slate-500={!favourite}
        class:border-yellow-500={favourite}
        on:focusout={() => { update_custom_emote(emote); }}
    />
    {#if show_other_buttons}
        <button 
            class="absolute left-0 bottom-4 text-yellow-500" 
            transition:fade|local={{ duration: 150 }}
            on:click={toggle_favourite}
        >
            <Star size={24}/>
        </button>
        <div class="absolute right-0 bottom-3" transition:fade|local={{ duration: 150 }}>
            <XButton on:click={() => { delete_custom_emote(emote.custom_emote_id); }}/>
        </div>
    {/if}
</div>