
<script lang="ts">

    import { Funnel } from "phosphor-svelte";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import { invoke } from "@tauri-apps/api";
    import Flatpickr, { type HookProps } from 'svelte-flatpickr'
    import 'flatpickr/dist/flatpickr.css'
    import { type IChatLogMessage } from "../../lib/network/chat_log_message";
    import { active_character } from "../../lib/network/characters";
    import { SwtorMessage } from "../../lib/network/swtor_message";
    import { afterUpdate } from "svelte";
    import SmallButton from "../../lib/buttons/SmallButton.svelte";
    import { get_all_channel_ids } from "../../lib/network/swtor_channel";
    import ChannelList from "../../components/_ChannelList.svelte";
    import Filter from "./_Filter.svelte";

    let container: HTMLElement | undefined    = undefined;
    let last_message: HTMLElement | undefined = undefined;

    let channel_filters: number[] = get_all_channel_ids();
    let dates: string[] = [];
    let date_messages: SwtorMessage[]     = [];
    let filtered_messages: SwtorMessage[] = [];

    let show_filters: boolean = false;

    function init_dates(callback?: () => void) {

        invoke("get_distinct_dates").then((response) => {

            dates = response as string[];

            if (callback != undefined) {
                callback();
            }

        });

    }

    function set_filtered_messages() {  

        filtered_messages = date_messages
            .filter((m) => channel_filters.includes(m.channel.type));

    }

    function on_change(e: CustomEvent<HookProps>) {

        let date = e.detail[1];
        invoke("get_chat_log_from_date", {date}).then((response) => {
            date_messages = (response as IChatLogMessage[]).map((m) => new SwtorMessage(m.message));
            set_filtered_messages();
        });

    }

    function scroll_to_last_message() {

        if (last_message == undefined) {
            return;
        }

        last_message.scrollIntoView({ behavior: "instant", block: "end" });

    }

    async function on_export() {

        const filepath = await save({
            filters: [{ name: "Text Files", extensions: ["txt"] }]
        });

        if (filepath == undefined) {
            return;
        }

        let temp: string[] = filtered_messages.map((m) => {
           return `[${m.timestamp}] ${m.get_message_from()} ${m.get_message_fragments().join(" ")}`;
        });

        await writeTextFile(filepath, temp.join("\n"));

    }

    $: if (channel_filters) {
        set_filtered_messages();
    }

    afterUpdate(() => {
        scroll_to_last_message();
    });

    init_dates();

</script>


<div class="px-6">

    <div class="h-8"></div>
    <div class="text-white text-2xl text-center bg-slate-600">Log Viewer</div>
    <div class="h-8"></div>

    <div class="grid grid-cols-2 w-full">
        <div class="w-full">
            <Flatpickr options={{ enable: dates }} on:change={on_change} name="date" placeholder="Select a date" class="outline-none border-2 border-slate-700 rounded-md px-2 text-xl"/>
        </div>
        <div class="flex flex-row-reverse relative w-full">
            <Filter bind:channel_filters={channel_filters}/>
        </div>
    </div>
    <div class="h-6"></div>
    <div bind:this={container} class="flex flex-col h-96 rounded-tr-md border-2 border-slate-700 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-slate-100 chat-container-background">
        {#each filtered_messages as message}

            <div bind:this={last_message} class="w-full opacity-100">
                <span class="text-white">[{message.timestamp}]</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="text-slate-200 cursor-pointer">
                    {message.get_message_from()}
                </span>
                {#each message.get_message_fragments() as fragment}
                    {#if fragment.startsWith("\"") && fragment.endsWith("\"")}
                        <span class="break-words " style="color: white;">{fragment}</span>
                    {:else}
                        <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{fragment}</span>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
    <div class="h-6"></div>
    <SmallButton on:click={on_export}>Export</SmallButton>
</div>