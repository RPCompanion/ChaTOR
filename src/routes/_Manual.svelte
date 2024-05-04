
<script lang="ts">

    import ConfirmationModal from "../lib/ConfirmationModal.svelte";
    import { valid_messages, truncate_messages } from "./utils";

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

        messages = truncate_messages(messages);
        if (valid_messages(messages)) {

            show_modal = true;

        } else {

            alert("Unable to post. Either you there are no messages to post, or no content to post.");

        }

    }

    function on_yes_confirmation() {
        show_modal = false;
        console.log("TODO")
    }

    function on_no_confirmation() {
        show_modal = false;
    }

</script>

<div class="flex flex-col gap-2 w-full p-10">
    <div class="text-white text-center bg-slate-700 text-xl">Manual Formatting Mode</div>
    {#each messages as message, idx}
        <div class="relative">
            <textarea class="w-full min-h-24 outline-none p-1 resize-none rounded-md border-2" class:border-yellow-400={message.length >= 200 && message.length <= 255} class:border-red-500={message.length > 255} bind:value={message}/>
            <button class="absolute bg-slate-700 px-1 -right-2 -top-3 text-white" style="border-radius: 50%" on:click={() => { delete_message(idx); }}>X</button>
            <div class="absolute bottom-1 right-0">{message.length}/255</div>
        </div>
    {/each}
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm" on:click={on_new_message}>New</button>
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm" on:click={enable_confirmation_modal}>Post</button>
</div>
<ConfirmationModal {show_modal} on:no={on_no_confirmation} on:yes={on_yes_confirmation}>
    Are you sure you want to post?
</ConfirmationModal>