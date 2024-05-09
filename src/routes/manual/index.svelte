
<script lang="ts">

    import { settings } from "../../lib/network/settings";
    import { onMount } from "svelte";
    import { toast } from "@zerodevx/svelte-toast";
    import ConfirmationModal from "../../lib/ConfirmationModal.svelte";
    import Checkbox from "../../lib/Checkbox.svelte";
    import { valid_messages, truncate_messages } from "../utils";
    import { submit_post } from "../../lib/network";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import CustomEmotesList from "../../lib/_CustomEmotesList.svelte";

    let messages: string[] = [""];

    let show_modal: boolean        = false;
    let automated_posting: boolean = true;

    function delete_message(idx: number) {
        messages.splice(idx, 1);
        messages = messages;
    }

    function on_new_message() {

        if (messages.length >= 3) {
            toast.push("You can only have 3 messages at a time.");
            return;
        }

        messages.push("");
        messages = messages;
    }

    function enable_confirmation_modal() {

        if (messages.length == 1 && messages[0].length == 0) {
            toast.push("You have no content to post.");
            return;
        }

        messages = truncate_messages(messages);
        let message_response = valid_messages(messages);

        if (message_response.is_ok()) {
            show_modal = true;
        } else {
            toast.push(message_response.unwrap_error());
        }

    }

    function on_yes_confirmation() {

        show_modal = false;
        let resposne = submit_post(messages);

        if (resposne.is_error()) {
            toast.push(resposne.unwrap_error());
        }
        
    }

    function on_no_confirmation() {
        show_modal = false;
    }

    function on_single_post(idx: number) {

        let response = submit_post([messages[idx]]);
        if (response.is_error()) {
            toast.push(response.unwrap_error());
        }

    }

    function clear_chat() {
        messages = [""];
    }

    function on_checked(event: any) {
        automated_posting = event.detail;
    }

    /*
    onMount(() => {

        function on_key_up(event: KeyboardEvent) {

            if (!$settings.chat.enter_to_send) {
                return;
            }

            if (event.key == "Enter" && !event.shiftKey) {
                enable_confirmation_modal();
            }

        }

        window.addEventListener("keyup", on_key_up);
        return () => {
            window.removeEventListener("keyup", on_key_up);
        }

    });
    */

    function on_submit(event: Event) {
        event.preventDefault();
        console.log("here")
    }

</script>

<div class="flex flex-col gap-2 w-full p-10 relative">
    <div class="text-white text-center bg-slate-700 text-2xl">Manual Formatting Mode</div>
    <div class="relative h-6">
        <Checkbox on:checked={on_checked} checked={automated_posting} size="small">Automated posting</Checkbox>
        <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 absolute right-0 hover:text-gray-300" on:click={clear_chat}>Clear chat</button>
    </div>
    <form>
        {#each messages as message, idx}
            <div class="relative">
                <textarea class="w-full min-h-24 outline-none p-1 resize-none rounded-md border-2" class:border-yellow-400={message.length >= 200 && message.length <= 255} class:border-red-500={message.length > 255} bind:value={message}/>
                {#if idx != 0}
                    <button class="absolute bg-slate-700 px-2 -right-2 -top-3 text-white text-xl" style="border-radius: 50%" on:click={() => { delete_message(idx); }}>X</button>
                {/if}
                <div class="absolute bottom-1 right-0">{message.length}/255</div>
                {#if !automated_posting}
                    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm px-2 absolute top-1/3 -right-8 hover:text-gray-300" on:click={() => { on_single_post(idx); }}>Post</button>
                {/if}
            </div>
        {/each}
    </form>
    <div class="w-full h-6 flex flex-row-reverse">
        <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 hover:text-gray-300" on:click={on_new_message}>New</button>
    </div>
    <!--<StandardMenuButton text="New" on:click={on_new_message}/>-->
    {#if automated_posting}
        <StandardMenuButton text="Post all" on:click={enable_confirmation_modal}/>
    {/if}
    <div class="h-6"></div>
    <CustomEmotesList/>
</div>
<ConfirmationModal {show_modal} on:no={on_no_confirmation} on:yes={on_yes_confirmation}>
    Are you sure you want to post?
</ConfirmationModal>

<style>
</style>