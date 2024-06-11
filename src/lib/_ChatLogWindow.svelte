
<script lang="ts">
    import { active_character } from "./network/characters";
    import { createEventDispatcher } from "svelte";
    import { SwtorMessage } from "./network/swtor_message";

    import { 
        SwtorChatTabMessages, 
        swtor_channel_messages,
        set_swtor_channel_messages_to_read 
    } from "./network/swtor_message/swtor_chat_tab_messages";
    
    import { afterUpdate, onMount } from "svelte";
    import Checkbox from "./Checkbox.svelte";
    import { ESwtorChannel } from "./network/swtor_channel";
    import { active_chat_tab_index } from "./chat_log_window/chat_log_window_store";
    import { settings } from "./network/settings";
    import ChatTabs from "./chat_log_window/_ChatTabs.svelte";
    import { players_filter } from "./network/players";
    import PlayerFilter from "../components/_PlayerFilter.svelte";
  import { unicode_unescape } from "./utils";

    let auto_scroll: boolean = true;
    let container: HTMLElement | undefined = undefined;
    let last_message: HTMLElement | undefined = undefined;

    let swtor_messages: SwtorMessage[] = [];
    $: swtor_messages = get_swtor_channel_messages($swtor_channel_messages, $active_chat_tab_index);
    $: if ($players_filter) {
        swtor_messages = get_swtor_channel_messages($swtor_channel_messages, $active_chat_tab_index);
    }

    const dispatch = createEventDispatcher();

    function on_character_click(message: SwtorMessage) {

        if (message.channel.type == ESwtorChannel.WHISPER && message.from == $active_character?.character_name) {
            dispatch("whisper", { character_name: message.to });
            return;
        }

        dispatch("whisper", { character_name: message.from });
    }

    function scroll_to_last_message() {

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

    function get_swtor_channel_messages(t_channel_messages: SwtorChatTabMessages[], index: number): SwtorMessage[] {

        return t_channel_messages
            .find((c) => c.chat_tab_name == get_active_chat_tab_name(index))?.messages
            .filter((m) => $players_filter.find((p) => p.value == m.from)?.selected) ?? [];

    }

    $: if ($swtor_channel_messages.length > 0) {
        set_swtor_channel_messages_to_read(get_active_chat_tab_name($active_chat_tab_index));
    }

    afterUpdate(() => {
        scroll_to_last_message();
    });

    onMount(() => {

        if (container != undefined) {
            container.style.height = $settings.chat_log.window.window.height + "px";
        }

        let observer = new ResizeObserver(entries => {

            for (let entry of entries) {

                if (entry.target != container) {
                    continue;
                }
                $settings.chat_log.window.window.height = entry.contentRect.height;
                break;

            }

        });

        observer.observe(container!);
        return () => {
            observer.disconnect();
        }

    });

</script>

<div class="w-full grid grid-cols-2">
    <div>
        <Checkbox bind:checked={auto_scroll} size="small">Auto scroll</Checkbox>
    </div>
    <div class="flex flex-row-reverse relative">
        <PlayerFilter bind:elems={$players_filter}/>
    </div>
</div>
<div>
    <ChatTabs/>
    <div 
        bind:this={container} class="flex flex-col h-44 max-h-96 resize-y rounded-tr-md border-2 border-slate-700 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-slate-100 chat-container-background">
        {#each swtor_messages as message}

            <div bind:this={last_message} class="w-full opacity-100">
                <span class="text-white">[{message.timestamp}]</span>

                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="text-slate-200 cursor-pointer" on:click={() => {on_character_click(message)}}>
                    {message.get_message_from()}
                </span>
                {#each message.get_message_fragments() as fragment}
                    {#if fragment.startsWith("\"") && fragment.endsWith("\"")}
                        <span class="break-words " style="color: white;">{unicode_unescape(fragment)}</span>
                    {:else}
                        <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{unicode_unescape(fragment)}</span>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
</div>