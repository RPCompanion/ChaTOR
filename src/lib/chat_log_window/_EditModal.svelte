
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { toast } from "@zerodevx/svelte-toast";
    import { Result, Ok, Err } from "../result";
    import { fly } from "svelte/transition";
    import type { IChatTab } from "../network/settings";
    import { settings } from "../network/settings";
    import { SwtorChannel } from "../network/swtor_channel";
    import { swtor_channel_messages } from "../network/swtor_message/swtor_chat_tab_messages";

    export let index: number | undefined = undefined;
    export let chat_tab: IChatTab = { name: "", channels: [] }
    export let show_edit_modal: boolean;

    const dispatch = createEventDispatcher();
    function on_cancel() {
        show_edit_modal = false;
    }

    function validate_chat_tab_name(): Result<[], string> {

        if (chat_tab.name.length == 0) {
            return Err("Chat tab name cannot be empty");
        }

        if (chat_tab.name.length > 12) {
            return Err("Chat tab name cannot be longer than 12 characters");
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
        let idx = $swtor_channel_messages.findIndex((c) => c.chat_tab_name == old_name);
        if (idx == -1) {
            return;
        }

        $swtor_channel_messages[idx].chat_tab_name = new_name;

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

        show_edit_modal = false;
        rename_swtor_channel_messages(chat_tab.name);
        dispatch("save", chat_tab);

    }

    function on_channel_input(channel: string) {

        let channel_number = Number(SwtorChannel[channel as keyof typeof SwtorChannel]);

        let index = chat_tab.channels.indexOf(channel_number);

        if (index == -1) {
            chat_tab.channels.push(channel_number);
        } else {
            chat_tab.channels.splice(index, 1);
        }

    }

</script>

{#if show_edit_modal}
    <div transition:fly|local="{{ duration: 500, y: -500 }}" class="w-72 min-h-48 bg-slate-700 p-2 border-2 border-slate-800 fixed z-20 modal-position flex flex-col gap-1">
        <input type="text" bind:value={chat_tab.name} maxlength="12" class=" outline-none border-2 border-slate-800 text-xl" placeholder="tab name">
        <p class="text-white text-xl"><b>Channel subscriptions</b></p>
        {#each Object.keys(SwtorChannel).filter((key) => isNaN(Number(key))) as channel}
            <div class="flex flex-row gap-1">
                <input type="checkbox" id={channel} name={channel} value={channel} checked={chat_tab.channels.includes(Number(SwtorChannel[channel]))} on:input={() => { on_channel_input(channel) }} class="text-xl">
                <label for={channel} class="text-white text-xl">{channel}</label>
            </div>
        {/each}
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
