
<script lang="ts">

    import { settings } from "../../lib/network/settings";
    import { toast } from "@zerodevx/svelte-toast";
    import XButton from "../../lib/buttons/XButton.svelte";
    import ConfirmationModal from "../../lib/ConfirmationModal.svelte";
    import Checkbox from "../../lib/Checkbox.svelte";
    import { valid_messages } from "../utils";
    import { submit_post } from "../../lib/network";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import CustomEmotesList from "../../lib/_CustomEmotesList.svelte";
    import ChatLogWindow from "../../lib/_ChatLogWindow.svelte";

    let messages: string[] = [""];

    let show_modal: boolean        = false;
    let automated_posting: boolean = true;


    const MAX_MESSAGES: number = 5;

    function delete_message(idx: number) {
        messages.splice(idx, 1);
        messages = messages;
    }

    function on_new_message() {

        if (messages.length >= MAX_MESSAGES) {
            toast.push(`You can only have ${MAX_MESSAGES} messages at a time.`);
            return;
        }

        messages.push("");
        messages = messages;
    }

    function on_post_all() {

        if (messages.length == 1 && messages[0].length == 0) {
            toast.push("You have no content to post.");
            return;
        }

        messages = messages.map((message) => message.trim());
        let message_response = valid_messages(messages);
        if (message_response.is_error()) {
            toast.push(message_response.unwrap_error());
            return;
        }

        if ($settings.chat.confirmation_before_posting) {
            show_modal = true;
        } else {
            submit_messages();
        }

    }

    async function submit_messages() {

        show_modal = false;
        let response = await submit_post("ChatMessage", messages);

        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
            return;
        }

        if ($settings.chat.clear_chat_after_posting) {
            clear_chat();
        }

    }

    function on_no_confirmation() {
        show_modal = false;
    }

    async function on_single_post(idx: number) {

        let response = await submit_post("ChatMessage", [messages[idx]]);
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
        }

    }

    function clear_chat() {
        messages = [""];
    }

    function on_checked(event: any) {
        automated_posting = event.detail;
    }

    function on_whisper(event: any) {
        messages[0] = "/w " + event.detail.character_name + ": ";
    }

</script>

<div class="flex flex-col gap-2 w-full p-10 relative">
    <div class="text-white text-center bg-slate-700 text-2xl">Manual Formatting Mode</div>
    {#if $settings.chat_log.capture_chat_log && $settings.chat_log.window.show_chat_log_window}
        <ChatLogWindow on:whisper={on_whisper}/>
    {/if}
    <div class="relative h-6">
        <Checkbox on:checked={on_checked} checked={automated_posting} size="small">Automated posting</Checkbox>
        {#if !$settings.chat.clear_chat_after_posting}
            <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm w-32 absolute right-0 hover:text-gray-300" on:click={clear_chat}>Clear chat</button>
        {/if}
    </div>
    {#each messages as message, idx}
        <div class="relative">
            <textarea class="w-full min-h-24 outline-none p-1 resize-none rounded-md border-2 border-slate-700 chat-container-background text-white" class:border-yellow-400={message.length >= 200 && message.length <= 255} class:border-red-500={message.length > 255} bind:value={message}/>
            {#if idx != 0}
                <div class="absolute -right-2 -top-3">
                    <XButton on:click={() => { delete_message(idx); }}/>
                </div>
            {/if}
            <div class="absolute bottom-1 right-0 text-white">{message.length}/255</div>
            {#if !automated_posting}
                <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm px-2 absolute top-1/3 -right-8 hover:text-gray-300" on:click={() => { on_single_post(idx); }}>Post</button>
            {/if}
        </div>
    {/each}
    <div class="w-full h-6 flex flex-row-reverse">
        <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm w-32 hover:text-gray-300" on:click={on_new_message}>New</button>
    </div>
    {#if automated_posting}
        <StandardMenuButton text="Post all" on:click={on_post_all}/>
    {/if}
    <div class="h-6"></div>
    <CustomEmotesList/>
</div>
<ConfirmationModal {show_modal} on:no={on_no_confirmation} on:yes={submit_messages}>
    Are you sure you want to post?
</ConfirmationModal>

<style>
</style>