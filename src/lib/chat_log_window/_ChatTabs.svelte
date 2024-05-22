
<script lang="ts">

    import ChatTab from "./_ChatTab.svelte";
    import { settings, type IChatTab } from "../network/settings";
    import { active_chat_tab_index } from "./chat_log_window_store";
    import EditModal from "./_EditModal.svelte";
    import { type SvelteDispatch } from "../svelte_utils";

    let show_edit_modal: boolean = false;
    function on_new_chat_tab() {
        show_edit_modal = true;
    }

    function on_save(event: SvelteDispatch<IChatTab>) {
        $settings.chat.chat_tabs.push(event.detail);
        $settings = $settings;
    }

</script>

<div class="flex flex-row gap-1 relative">
    {#each $settings.chat.chat_tabs as chat_tab, index}
        <ChatTab {chat_tab} {index} />
    {/each}
    <div class="relative">
        <button type="button" class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400" on:click={on_new_chat_tab}>+</button>
        <EditModal bind:show_edit_modal={show_edit_modal} on:save={on_save} />
    </div>
</div>

