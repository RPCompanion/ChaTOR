
<script lang="ts">

    import ChatTab from "./_ChatTab.svelte";
    import { settings, type IChatTab } from "../network/settings";
    import { active_chat_tab_index } from "./chat_log_window_store";
    import EditModal from "./_EditModal.svelte";
    import { type SvelteDispatch } from "../svelte_utils";
  import { set_swtor_channel_messages_read } from "./chat_log_window_utils";

    let show_edit_modal: boolean = false;
    let old_chat_tab_index: number = $active_chat_tab_index;
    function on_new_chat_tab() {
        show_edit_modal = true;
    }

    function on_save(event: SvelteDispatch<IChatTab>) {
        $settings.chat.chat_tabs.push(event.detail);
        $settings = $settings;
    }
    
    $: if ($active_chat_tab_index != old_chat_tab_index) {
        set_swtor_channel_messages_read($settings.chat.chat_tabs[$active_chat_tab_index].name);
        old_chat_tab_index = $active_chat_tab_index;
    }

</script>

<div class="flex flex-row gap-1 relative">
    {#each $settings.chat.chat_tabs as chat_tab, index}
        <ChatTab chat_tab={JSON.parse(JSON.stringify(chat_tab))} {index} />
    {/each}
    <div class="relative">
        <button type="button" class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400" on:click={on_new_chat_tab}>+</button>
        <EditModal bind:show_edit_modal={show_edit_modal} on:save={on_save} />
    </div>
</div>

