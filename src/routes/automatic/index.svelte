
<script lang="ts">
   
    import { toast } from "@zerodevx/svelte-toast";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import { auto_message_split } from "../utils";
    import AutomaticConfirmation from "./_AutomaticConfirmation.svelte";

    let message: string     = "";
    let messages: string[]  = [];
    let show_modal: boolean = false;

    function clear_chat() {
        message = "";
    }

    function enable_confirmation_modal() {

        if (message.trim().length == 0) {
            toast.push("You have no content to post.");
            return;
        }

        let response = auto_message_split(message);
        if (response.is_error()) {
            toast.push("Error: " + response.unwrap_error());
            return;
        }

        messages = response.unwrap();
        show_modal = true;

    }

</script>


<div class="flex flex-col gap-2 w-full p-10">
    <div class="text-white text-center bg-slate-700 text-2xl">Automatic Formatting Mode</div>
    <div class="relative h-6">
        <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 absolute right-0" on:click={clear_chat}>Clear chat</button>
    </div>
    <div class="relative">
        <textarea class="w-full min-h-36 outline-none p-1 rounded-md border-2 resize-none" bind:value={message}/>
        <div class="absolute bottom-1 right-2">{message.length}</div>
    </div>
    <StandardMenuButton text="Post" on:click={enable_confirmation_modal}/>
</div>
<AutomaticConfirmation {messages} {show_modal} on:cancel={() => { show_modal = false; }}/>