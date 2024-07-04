
<script lang="ts">

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
    import { get_all_channel_dispatch, get_all_channel_ids } from "../../lib/network/swtor_channel";
    import Filter from "./_Filter.svelte";
    import PlayerFilter from "../../components/_PlayerFilter.svelte";
    import { type IListElem } from "../../components/select_list";
    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { unicode_unescape } from "../../lib/utils";
    import { date_tag_new, get_all_date_tag_favourites, type IDateTag } from "../../lib/network/datetags";
    import Favourite from "./_Favourite.svelte";
    import Checkbox from "../../lib/Checkbox.svelte";
    import type { ChannelDispatcher } from "../../lib/network/settings";

    let container: HTMLElement | undefined   = undefined;
    let last_message: HTMLElement | undefined = undefined;

    let channel_filters: ChannelDispatcher[] = get_all_channel_dispatch();
    let channel_numbers: number[] = [];
    $: channel_numbers = channel_filters
        .filter((c): c is { RegularDispatch: number } => "RegularDispatch" in c)
        .map((c) => c.RegularDispatch);

    /* 
        all_dates contains all distinct dates in the database. Not to be changed once set.
    */
    let all_dates: string[] = [];
    let dates: string[] = [];

    let date_messages: SwtorMessage[]     = [];
    let players: IListElem<string>[]      = [];
    let filtered_messages: SwtorMessage[] = [];
    let active_date: string | undefined   = undefined;
    let date_tags: IDateTag[] = [];

    let show_only_favourites: boolean = false;
    $: show_only_favourites = date_tags.filter((dt) => dt.favourite).length > 0 ? show_only_favourites : false;

    async function init_dates(callback?: () => void) {

        invoke("get_distinct_dates").then((response) => {

            all_dates = response as string[];
            dates     = response as string[];

            if (callback != undefined) {
                callback();
            }

        });

        await init_date_tags();

    }

    async function init_date_tags() {

        let response = await get_all_date_tag_favourites();
        if (response.is_error()) {
            return;
        }

        date_tags = response.unwrap();
        dates.forEach((date) => {

            let date_tag = date_tags.find((tag) => tag.date == date);
            if (date_tag == undefined) {
                date_tags.push(date_tag_new(date));
            }

        });

    }

    function set_filtered_messages() {  

        filtered_messages = date_messages
            .filter((m) => channel_numbers.includes(m.channel.type))
            .filter((m) => players.find((p) => p.value == m.from)?.selected);

    }

    function on_change(e: CustomEvent<HookProps>) {

        active_date = e.detail[1];
        invoke("get_chat_log_from_date", {date: active_date}).then((response) => {

            date_messages = (response as IChatLogMessage[]).map((m) => new SwtorMessage(m.message));
            
            let player_names = date_messages.map((m) => m.from);
            let unique_player_names = [...new Set(player_names)];

            players = unique_player_names.map((name) => {
                return { value: name, selected: true };
            });

            set_filtered_messages();

        });

    }

    function reset_messages() {

        date_messages     = [];
        filtered_messages = [];
        players           = [];

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

            let flat_message = ""; 
            m.message_fragments.forEach((f) => {
                if (typeof f == "string") {
                    flat_message += f + " ";
                } else {
                    flat_message += f.as_string().unwrap_or("");
                }
            });

            return `[${m.timestamp}] ${m.get_message_from()} ${flat_message.trim()}`;
            
        });

        await writeTextFile(filepath, temp.join("\n\n"));

    }

    function on_date_tag_change(e: CustomEvent<IDateTag>) {

        date_tags = date_tags
            .map((dt) => {

                if (dt.date == e.detail.date) {
                    return e.detail;
                }

                return dt;

            });

    }

    function on_change_show_favourites(e: CustomEvent<boolean>) {

        show_only_favourites = e.detail;
        if (show_only_favourites) {
            dates = date_tags.filter((dt) => dt.favourite).map((dt) => dt.date);
        } else {
            dates = all_dates;
        }
        reset_messages();

    }

    $: if (channel_filters || players) {
        set_filtered_messages();
    }

    afterUpdate(() => {
        scroll_to_last_message();
    });

    init_dates();

</script>


<PageFormatting title="Log Viewer">
    <div class="grid grid-cols-2 w-full">
        <div class="w-full">
            <Flatpickr options={{ enable: dates }} on:change={on_change} name="date" placeholder="Select a date" class="outline-none border-2 border-slate-700 rounded-md px-2 text-xl"/>
        </div>
        <div class="flex flex-row-reverse relative w-full gap-2">
            <Filter bind:channel_filters={channel_filters}/>
            <PlayerFilter bind:elems={players}/>
        </div>
    </div>
    {#if date_tags.filter((dt) => dt.favourite).length > 0}
        <div class="h-2"></div>
        <div class="">
            <Checkbox size="small" on:checked={on_change_show_favourites}>Show only favorite dates</Checkbox>
        </div>
    {/if}
    <div class="h-6"></div>
    <div bind:this={container} class="flex flex-col h-96 resize-y max-h-full rounded-tr-md border-2 border-slate-700 overflow-y-auto scrollbar scrollbar-thumb-sky-800 scrollbar-track-slate-100 chat-container-background">
        {#each filtered_messages as message}

            <div bind:this={last_message} class="w-full opacity-100">
                <span class="text-white">[{message.timestamp}]</span>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <span class="text-slate-200 cursor-pointer">
                    {message.get_message_from()}
                </span>
                {#each message.message_fragments as fragment}
                    {#if typeof fragment == "string"}
                         <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{unicode_unescape(fragment)}</span>
                    {:else}
                        {#if fragment.as_string().is_some()}
                            <span class="break-words " style="color: {$active_character?.get_channel_color(message.channel.type).to_hex()}">{fragment}</span>
                        {/if}
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
    {#if filtered_messages.length > 0}
        <div class="h-6"></div>
        <div class="grid grid-cols-2 w-full">
            <div class="w-full">
                <Favourite date_tag={date_tags.find((dt) => dt.date == active_date)} on:change={on_date_tag_change}/>
            </div>
            <div class="flex flex-row-reverse w-full">
                <SmallButton on:click={on_export}>Export</SmallButton>
            </div>
        </div>
    {/if}
</PageFormatting>