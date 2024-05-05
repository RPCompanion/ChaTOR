
<script lang="ts">

    import { toast } from "@zerodevx/svelte-toast";
    import ConfirmationModal from "../lib/ConfirmationModal.svelte";
    import { valid_messages, truncate_messages } from "./utils";
    import { submit_post } from "../lib/network";

    let messages: string[] = [""];

    let show_modal: boolean = false;

    function delete_message(idx: number) {
        messages.splice(idx, 1);
        messages = messages;
    }

    function on_new_message() {
        messages.push("");
        messages = messages;
    }

    function enable_confirmation_modal() {

        if (messages.length == 1 && messages[0].length == 0) {
            alert("You have no content to post.");
            return;
        }

        messages = truncate_messages(messages);
        let message_response = valid_messages(messages);
        if (message_response.valid) {

            show_modal = true;

        } else {

            alert(message_response.reason!);

        }

    }

    function on_yes_confirmation() {

        show_modal = false;
        let resposne = submit_post(messages);

        if (resposne.is_error()) {
            toast.push("Error: " + resposne.unwrap_error());
        }
        
    }

    function on_no_confirmation() {
        show_modal = false;
    }

    function clear_chat() {
        messages = [""];
    }

</script>

<div class="flex flex-col gap-2 w-full p-10">
    <div class="text-white text-center bg-slate-700 text-xl">Manual Formatting Mode</div>
    <div class="relative h-6">
        <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 absolute right-0" on:click={clear_chat}>Clear chat</button>
    </div>
    {#each messages as message, idx}
        <div class="relative">
            <textarea class="w-full min-h-24 outline-none p-1 resize-none rounded-md border-2" class:border-yellow-400={message.length >= 200 && message.length <= 255} class:border-red-500={message.length > 255} bind:value={message}/>
            {#if idx != 0}
                <button class="absolute bg-slate-700 px-1 -right-2 -top-3 text-white" style="border-radius: 50%" on:click={() => { delete_message(idx); }}>X</button>
            {/if}
            <div class="absolute bottom-1 right-0">{message.length}/255</div>
        </div>
    {/each}
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm" on:click={on_new_message}>New</button>
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm" on:click={enable_confirmation_modal}>Post</button>
</div>
<ConfirmationModal {show_modal} on:no={on_no_confirmation} on:yes={on_yes_confirmation}>
    Are you sure you want to post?
</ConfirmationModal>