
<script lang="ts">

    import { settings } from "../../lib/network/settings";
    import { toast } from "@zerodevx/svelte-toast";
    import { submit_post } from "../../lib/network";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import { auto_message_split } from "../utils";
    import AutomaticConfirmation from "./_AutomaticConfirmation.svelte";
    import CustomEmotesList from "../../lib/_CustomEmotesList.svelte";

    let message: string     = "";
    let messages: string[]  = [];
    let show_modal: boolean = false;

    function clear_chat() {
        message = "";
    }

    function on_submitted() {

        show_modal = false;
        submit_post(messages);
        if ($settings.chat.clear_chat_after_posting) {
            message = "";
        }

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

    function on_key_down(event: KeyboardEvent) {

        if (!$settings.chat.enter_to_post) {
            return;
        }

        if (event.key == "Enter" && !event.shiftKey) {
            event.preventDefault();
            enable_confirmation_modal();
        }

    }

</script>

<div class="flex flex-col gap-2 w-full p-10 relative">
    <div class="text-white text-center bg-slate-700 text-2xl">Automatic Formatting Mode</div>
    <div class="relative h-6">
        <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 absolute right-0" on:click={clear_chat}>Clear chat</button>
    </div>
    <div class="relative">
        <textarea class="w-full min-h-36 outline-none p-1 rounded-md border-2 resize-none border-slate-500" bind:value={message} on:keydown={on_key_down}/>
        <div class="absolute bottom-1 right-2">{message.length}</div>
    </div>
    <StandardMenuButton text="Post" on:click={enable_confirmation_modal}/>
    <div class="h-6"></div>
    <CustomEmotesList/>
</div>
<AutomaticConfirmation bind:messages={messages} {show_modal} on:cancel={() => { show_modal = false; }} on:submitted={on_submitted}/>