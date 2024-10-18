
<script lang="ts">

    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { settings } from "../../lib/network/settings";
    import { active_chat_tab_index } from "../../lib/chat_log_window/chat_log_window_store";
    import { toast } from "@zerodevx/svelte-toast";
    import { submit_post } from "../../lib/network";
    import StandardMenuButton from "../../lib/buttons/StandardMenuButton.svelte";
    import { AutoMessageSplitter } from "../../lib/auto_message_splitter";
    import AutomaticConfirmation from "./_AutomaticConfirmation.svelte";
    import CustomEmotesList from "../../components/emotes_list/_CustomEmotesList.svelte";
    import ChatLogWindow from "../../lib/_ChatLogWindow.svelte";
    import CustomCommand from "../../components/_CustomCommand.svelte";
    import { None, type Option, Some } from "../../lib/option";
    import { SwtorChannel } from "../../lib/network/swtor_channel";
    import { unicode_escape } from "../../lib/utils";
    import { get_custom_channel_number } from "../../lib/network/custom_channels";

    let message: string     = "";
    let messages: string[]  = [];
    let show_modal: boolean = false;
    let textarea_elem: HTMLTextAreaElement | null = null;

    function clear_chat() {
        message = "";
    }

    async function on_submitted() {

        show_modal = false;
        let resposne = await submit_post("ChatMessage", messages);

        if (resposne.is_err()) {
            return;
        }

        if ($settings.chat.clear_chat_after_posting) {
            message = "";
        }

    }

    function get_custom_command(): Option<string> {

        let default_channel = $settings.chat_log.window.chat_tabs[$active_chat_tab_index].default_channel;
        
        if (default_channel == undefined) {
            return None();
        }

        let custom_command: Option<string> = None();
        if ("RegularDispatch" in default_channel) {

            custom_command = new SwtorChannel(default_channel.RegularDispatch).get_command();

        } else {

            get_custom_channel_number(default_channel.CustomDispatch).is_some_cb((channel_number) => {

                custom_command = Some("/" + channel_number);
                
            });

        }

        return custom_command;

    }

    function enable_confirmation_modal() {

        if (message.trim().length == 0) {
            toast.push("You have no content to post.");
            return;
        }

        let custom_command = get_custom_command();

        let response = new AutoMessageSplitter(unicode_escape(message), undefined, custom_command).split();
        if (response.is_err()) {
            toast.push("Error: " + response.unwrap_err());
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

    function on_whisper(event: any) {

        message = "/w " + event.detail.character_name + ": ";
        textarea_elem!.focus();

    }

</script>


<PageFormatting title="Automatic Formatting Mode">
    <div class="flex flex-col gap-2">
        {#if $settings.chat_log.capture_chat_log && $settings.chat_log.window.show_chat_log_window}
            <ChatLogWindow on:whisper={on_whisper}/>
        {/if}
        {#if !$settings.chat.clear_chat_after_posting}
            <div class="relative h-6">
                <button type="button" class="bg-slate-800 text-white rounded-sm shadow-sm w-32 absolute right-0" on:click={clear_chat}>Clear chat</button>
            </div>
        {/if}
        <div class="relative">
            <textarea 
                bind:this={textarea_elem} 
                class="w-full min-h-36 outline-none p-1 rounded-md border-2 resize-none border-slate-700 chat-container-background text-white" 
                bind:value={message} 
                on:keydown={on_key_down}
            />
            <div class="absolute bottom-1 right-2 text-white select-none">{unicode_escape(message).length}</div>
            {#if $settings.chat_log.capture_chat_log && $settings.chat_log.window.show_chat_log_window}
                <CustomCommand/>
            {/if}
        </div>
        <StandardMenuButton text="Post" on:click={enable_confirmation_modal}/>
        {#if $settings.chat.show_favourite_emotes}
            <div class="h-6"></div>
            <CustomEmotesList/>
        {/if}
    </div>
</PageFormatting>
<AutomaticConfirmation bind:messages={messages} {show_modal} on:cancel={() => { show_modal = false; }} on:submitted={on_submitted}/>