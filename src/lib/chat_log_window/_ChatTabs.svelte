
<script lang="ts">
    
    import ChatTab from "./_ChatTab.svelte";
    import { settings } from "../network/settings";
    import { active_chat_tab } from "./chat_log_window_store";

    function on_new_chat_tab() {

    }

</script>

<div class="flex flex-row gap-1 relative">
    {#each $settings.chat.chat_tabs as chat_tab}
        <ChatTab {chat_tab} />
    {/each}
    <button type="button" class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400" on:click={on_new_chat_tab}>+</button>
</div>

