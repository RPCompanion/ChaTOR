
<script lang="ts">
    import { swtor_messages } from "./network/swtor_message";
</script>

<div class="flex flex-col h-44 bg-white rounded-md border-2 border-slate-500 overflow-y-auto">
    {#each $swtor_messages as message}
    <div class="flex flex-row gap-1">
        <div>{message.character_name}</div>
        <div>{message.timestamp}</div>
        <div>{message.message}</div>
    </div>
    {/each}
</div>