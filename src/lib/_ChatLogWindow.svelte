
<script lang="ts">
    import { active_character } from "./network/characters";
    import { createEventDispatcher } from "svelte";
    import { SwtorChatTabMessages, SwtorMessage, swtor_channel_messages } from "./network/swtor_message";
    import { afterUpdate } from "svelte";
    import Checkbox from "./Checkbox.svelte";
    import { SwtorChannel } from "./network/swtor_channel";
    import { active_chat_tab_index } from "./chat_log_window/chat_log_window_store";
    import { settings } from "./network/settings";
    import ChatTabs from "./chat_log_window/_ChatTabs.svelte";
    import { set_swtor_channel_messages_read } from "./chat_log_window/chat_log_window_utils";

    let auto_scroll: boolean = true;
    let container: HTMLElement | undefined = undefined;
    let last_message: HTMLElement | undefined = undefined;
    const dispatch = createEventDispatcher();

    function on_character_click(message: SwtorMessage) {

        if (message.channel.type == SwtorChannel.WHISPER && message.from == $active_character?.character_name) {
            dispatch("whisper", { character_name: message.to });
            return;
        }

        dispatch("whisper", { character_name: message.from });
    }

    function scroll_container() {

        if (last_message == undefined) {
            return;
        }

        if (!auto_scroll) {
            return;
        }

        last_message.scrollIntoView({ behavior: "smooth", block: "end" });

    }

    function get_active_chat_tab_name(index: number): string {
        return $settings.chat.chat_tabs[index].name;
    }

    function get_swtor_channel_messages(t_channel_messages: SwtorChatTabMessages[], index: number ): SwtorMessage[] {
        return t_channel_messages.find((c) => c.chat_tab_name == get_active_chat_tab_name(index))?.messages ?? [];
    }

    $: if ($swtor_channel_messages.length > 0) {
        set_swtor_channel_messages_read(get_active_chat_tab_name($active_chat_tab_index));
    }

    afterUpdate(() => {
        scroll_container();
    });

</script>

<div class="w-full">
    <Checkbox bind:checked={auto_scroll} size="small">Auto scroll</Checkbox>
</div>
<div>
    <ChatTabs/>
    <div bind:this={container} class="flex flex-col h-44 max-h-96 resize-y rounded-tr-md border-2 border-slate-700 overflow-y-auto chat-container-background">
        {#each get_swtor_channel_messages($swtor_channel_messages, $active_chat_tab_index) as message}

            <div bind:this={last_message} class="w-full opacity-100">

                <span class="text-white">[{message.timestamp}]</span>

                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="text-slate-200 cursor-pointer" on:click={() => {on_character_click(message)}}>
                    {#if message.from == $active_character?.character_name && message.channel.type == SwtorChannel.WHISPER}
                        [to {message.to}]:
                    {:else}
                        {message.from}:
                    {/if}
                </span>
                <span class="" style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{message.message}</span>
            </div>

        {/each}
    </div>
</div>

<style>

</style>