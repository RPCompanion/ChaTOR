
<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { toast } from "@zerodevx/svelte-toast";
    import { Result, Ok, Err } from "../result";
    import { fly } from "svelte/transition";
    import type { IChatTab } from "../network/settings";
    import { settings } from "../network/settings";
    import { rename_swtor_channel, swtor_channel_messages } from "../network/swtor_message/swtor_chat_tab_messages";
    import ChannelList from "../../components/_ChannelList.svelte";
    import { deep_copy } from "../utils";

    export let index: number | undefined = undefined;
    export let chat_tab: IChatTab = { name: "", channels: [] }

    let show_edit_modal: boolean = false;
    let chat_tab_cached = deep_copy(chat_tab);

    const CHAT_TAB_MAX_LENGTH: number = 16;
    const dispatch = createEventDispatcher();

    function cancel_clean_up() {

        chat_tab = deep_copy(chat_tab_cached);

    }

    function on_cancel() {

        cancel_clean_up();
        dispatch("cancel");

    }

    function validate_chat_tab_name(): Result<[], string> {

        if (chat_tab.name.length == 0) {
            return Err("Chat tab name cannot be empty");
        }

        if (chat_tab.name.length > CHAT_TAB_MAX_LENGTH) {
            return Err(`Chat tab name cannot be longer than ${CHAT_TAB_MAX_LENGTH} characters`);
        }

        let filter_results = $settings.chat_log.window.chat_tabs.filter((tab) => tab.name == chat_tab.name);

        if (index == undefined || $settings.chat_log.window.chat_tabs[index].name != chat_tab.name) {
            
            if (filter_results.length > 0) {
                return Err("Chat tab name must be unique");
            }

        }

        return Ok([]);

    }

    function validate_channels(): Result<[], string> {
            
        if (chat_tab.channels.length == 0) {
            return Err("Chat tab must have at least one channel");
        }
        return Ok([]);

    }

    function rename_swtor_channel_messages(new_name: string) {

        if (index == undefined) {
            return;
        }

        let old_name = $settings.chat_log.window.chat_tabs[index].name;
        rename_swtor_channel(old_name, new_name);

    }

    function on_save() {
        
        chat_tab.name = chat_tab.name.trim();

        let name_result = validate_chat_tab_name();
        if (name_result.is_error()) {
            toast.push(name_result.unwrap_error(), { theme: { '--toastBarBackground': 'red' } });
            return;
        }

        let c_result = validate_channels();
        if (c_result.is_error()) {
            toast.push(c_result.unwrap_error(), { theme: { '--toastBarBackground': 'red' } });
            return;
        }

        rename_swtor_channel_messages(chat_tab.name);
        dispatch("save", chat_tab);

    }

    onMount(() => {

        show_edit_modal = true;

    })

</script>

{#if show_edit_modal}
    <div transition:fly|global="{{ duration: 500, y: -1000 }}" class="w-72 min-h-48 bg-slate-700 p-2 border-2 border-slate-800 fixed z-20 modal-position flex flex-col gap-1">
        <input type="text" bind:value={chat_tab.name} maxlength="12" class=" outline-none border-2 border-slate-800 text-xl" placeholder="tab name">
        <p class="text-white text-xl"><b>Channel subscriptions</b></p>
        <ChannelList bind:channels={chat_tab.channels} show_custom_channels={true}/>
        <div class="flex flex-row gap-1">
            <button type="button" class="text-white border-slate-800 border-2 rounded-md w-1/2 text-xl" on:click={on_save}>Save</button>
            <button type="button" on:click={on_cancel} class="text-white border-slate-800 border-2 rounded-md w-1/2 text-xl" on:click={on_cancel}>Cancel</button>
        </div>
    </div>
{/if}

<style>
    .modal-position {
        top: calc(50% - 12rem);
        left: calc(50% - 18rem/2);
    }
</style>
