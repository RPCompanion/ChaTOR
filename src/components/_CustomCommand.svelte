
<script lang="ts">
    import { type Option, Some, None } from "../lib/option";
    import { ESwtorChannel, SwtorChannel } from "../lib/network/swtor_channel";
    import { active_chat_tab_index } from "../lib/chat_log_window/chat_log_window_store";
    import { settings } from "../lib/network/settings";

</script>

<div>
    <select class="rounded-md outline-none border-none bg-slate-600 text-white px-1">
        {#each Object.keys(ESwtorChannel).filter((key) => isNaN(Number(key))) as channel}
            <option>{channel.toLowerCase().replace("_", " ")}</option>
        {/each}
    </select>
</div>
