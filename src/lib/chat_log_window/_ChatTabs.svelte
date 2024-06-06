
<script lang="ts">

    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import ChatTab from "./_ChatTab.svelte";
    import { settings, type IChatTab } from "../network/settings";
    import { active_chat_tab_index } from "./chat_log_window_store";
    import EditModal from "./_EditModal.svelte";
    import { type SvelteDispatch } from "../svelte_utils";
    import { add_swtor_channel, set_swtor_channel_messages_to_read } from "../network/swtor_message/swtor_chat_tab_messages";
    import { deep_copy } from "../utils";

    interface DNDChatTab extends IChatTab {
        id: number;
    }

    let show_edit_modal: boolean = false;
    let old_chat_tab_index: number = $active_chat_tab_index;

    let items: DNDChatTab[] = get_dnd_chat_tabs(); 

    function on_new_chat_tab() {

        show_edit_modal = true;

    }

    function on_modal_save(event: SvelteDispatch<IChatTab>) {

        $settings.chat_log.window.chat_tabs.push(event.detail);
        $settings = $settings;
        items = get_dnd_chat_tabs();
        show_edit_modal = false;
        add_swtor_channel(event.detail.name);
        
    }

    function on_modal_cancel() {

        show_edit_modal = false;

    }

    function get_dnd_chat_tabs() {
            
        return $settings.chat_log.window.chat_tabs
            .map((chat_tab, index) => ({ ...chat_tab, id: index }));
            
    }

    function on_consider(e: CustomEvent<DndEvent<DNDChatTab>>) {

        items = e.detail.items;

    }

    function on_finalize(e: CustomEvent<DndEvent<DNDChatTab>>) {

        $settings.chat_log.window.chat_tabs = e.detail.items;
        items = get_dnd_chat_tabs();

    }
    
    $: if ($active_chat_tab_index != old_chat_tab_index) {
        set_swtor_channel_messages_to_read($settings.chat_log.window.chat_tabs[$active_chat_tab_index].name);
        old_chat_tab_index = $active_chat_tab_index;
    }

</script>

<div class="flex flex-row gap-1 relative">
    <div class="flex flex-row gap-1 relative" use:dndzone="{{items}}" on:consider={on_consider} on:finalize={on_finalize}>
        {#each items as chat_tab(chat_tab.id)}
            <ChatTab chat_tab={deep_copy(chat_tab)} index={chat_tab.id} />
        {/each}
    </div>
    <div class="relative">
        <button type="button" class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400" on:click={on_new_chat_tab}>+</button>
        {#if show_edit_modal}
            <EditModal on:save={on_modal_save} on:cancel={on_modal_cancel} />
        {/if}
    </div>
</div>

