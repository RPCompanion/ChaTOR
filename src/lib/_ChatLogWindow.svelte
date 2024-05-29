
<script lang="ts">
    import { active_character } from "./network/characters";
    import { createEventDispatcher } from "svelte";
    import { SwtorMessage } from "./network/swtor_message";

    import { 
        SwtorChatTabMessages, 
        swtor_channel_messages,
        set_swtor_channel_messages_to_read 
    } from "./network/swtor_message/swtor_chat_tab_messages";
    
    import { afterUpdate } from "svelte";
    import Checkbox from "./Checkbox.svelte";
    import { SwtorChannel } from "./network/swtor_channel";
    import { active_chat_tab_index } from "./chat_log_window/chat_log_window_store";
    import { settings } from "./network/settings";
    import ChatTabs from "./chat_log_window/_ChatTabs.svelte";
    import { Option, Some, None } from "./option";

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

        last_message.scrollIntoView({ behavior: "instant", block: "end" });

    }

    function get_active_chat_tab_name(index: number): string {
        return $settings.chat_log.window.chat_tabs[index].name;
    }

    function get_swtor_channel_messages(t_channel_messages: SwtorChatTabMessages[], index: number ): SwtorMessage[] {
        return t_channel_messages.find((c) => c.chat_tab_name == get_active_chat_tab_name(index))?.messages ?? [];
    }

    function get_swtor_channel_text(message: SwtorMessage): Option<string> {

        switch (message.channel.type) {
            case SwtorChannel.SAY:     return Some("say");
            case SwtorChannel.YELL:    return Some("yell");
            case SwtorChannel.EMOTE:   return Some("emote");
            case SwtorChannel.WHISPER: return Some("whisper");
            case SwtorChannel.GLOBAL:  return Some("global");
            case SwtorChannel.PVP:     return Some("pvp");
            case SwtorChannel.TRADE:   return Some("trade");
            case SwtorChannel.GROUP:   return Some("group");
            case SwtorChannel.GUILD:   return Some("guild");
            default:                   return None();
        }

    }

    function get_message_from(message: SwtorMessage): string {
        
        if (message.channel.type == SwtorChannel.WHISPER && message.from == $active_character?.character_name) {
            return `[to ${message.to}]`;
        }

        let channel_text = get_swtor_channel_text(message);
        if (channel_text.is_some()) {
            return `[${channel_text.unwrap()}] ${message.from}:`;
        }

        return message.from;

    }

    const COMPUTE_MESSAGE_FRAGMENTS: boolean = false;
    function get_message_fragments(message: SwtorMessage): string[] {

        if (!COMPUTE_MESSAGE_FRAGMENTS) {
            return [message.message];
        }

        let idx = message.message.indexOf("\"");
        if (idx == -1) {
            return [message.message];
        }

        let fragments: string[] = [message.message.substring(0, idx)];
        let temp: string        = message.message.substring(idx);

        while (true) {

            idx = temp.indexOf("\"", 1);
            if (idx != -1) {

                if (temp.startsWith("\"")) {
                    fragments.push(temp.substring(0, idx + 1));
                    temp = temp.substring(idx + 1);
                } else {
                    fragments.push(temp.substring(0, idx));
                    temp = temp.substring(idx);
                }

            } else {
                break;
            }

        }

        if (temp.length > 0) {
            fragments.push(temp);
        }

        return fragments;

    }

    $: if ($swtor_channel_messages.length > 0) {
        set_swtor_channel_messages_to_read(get_active_chat_tab_name($active_chat_tab_index));
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
    <div bind:this={container} class="flex flex-col h-44 max-h-96 resize-y rounded-tr-md border-2 border-slate-700 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-slate-100 chat-container-background">
        {#each get_swtor_channel_messages($swtor_channel_messages, $active_chat_tab_index) as message}

            <div bind:this={last_message} class="w-full opacity-100">

                <span class="text-white">[{message.timestamp}]</span>

                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="text-slate-200 cursor-pointer" on:click={() => {on_character_click(message)}}>
                    {get_message_from(message)}
                </span>
                {#each get_message_fragments(message) as fragment}
                    {#if fragment.startsWith("\"") && fragment.endsWith("\"")}
                        <span class="break-words " style="color: white;">{fragment}</span>
                    {:else}
                        <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{fragment}</span>
                    {/if}
                {/each}
            </div>

        {/each}
    </div>
</div>