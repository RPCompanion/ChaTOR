
<script lang="ts">

    import type { SwtorMessage } from "../lib/network/swtor_message";
    import MessageFragment from "./messages/MessageFragment.svelte";
    export let message: SwtorMessage;

</script>

{#each message.message_fragments as fragment}
    <MessageFragment fragment={fragment} channel_type={message.channel.type} />
{/each}