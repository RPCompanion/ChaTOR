
<script lang="ts">
    import type { IChatTab } from "../network/settings";
    export let chat_tab: IChatTab;
</script>

<button type="button" class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400 h-8">
    {chat_tab.name}
</button>