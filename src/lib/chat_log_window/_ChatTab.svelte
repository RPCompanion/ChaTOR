
<script lang="ts">
    import EditModal from "./_EditModal.svelte";
    import { settings } from "../network/settings";
    import { click_outside_handler } from "../click_outside";
    import { active_chat_tab_index } from "./chat_log_window_store";
    import type { IChatTab } from "../network/settings";
    export let chat_tab: IChatTab;
    export let index: number;

    let show_edit_tab: boolean = false;
    let show_edit_modal: boolean = false;
    function on_click() {

        if ($active_chat_tab_index == index) {
            show_edit_tab = !show_edit_tab;
            return;
        }

        $active_chat_tab_index = index;

    }

    function click_outside() {

        show_edit_tab = false;

    }

    function on_edit() {

        show_edit_tab = false;
        show_edit_modal = true;

    }

    function on_delete() {

        show_edit_tab = false;
        $settings.chat.chat_tabs.splice(index, 1);
        $settings = $settings;
        
        if ($active_chat_tab_index != 0) {
            $active_chat_tab_index -= 1;
        }

    }

    function on_modal_save(event: any) {

        $settings.chat.chat_tabs[index] = event.detail;
        $settings = $settings;

    }

</script>

<div class="relative" use:click_outside_handler on:click_outside={click_outside}>
    <button 
        type="button" 
        class="chat-container-background text-white text-xl px-2 rounded-t-md hover:text-gray-400" 
        class:active-tab={$active_chat_tab_index == index}
        on:click={on_click}>
        {chat_tab.name}
    </button>
    {#if show_edit_tab}
        <!-- svelte-ignore ts2614 -->
        <div class="flex flex-col gap-1 w-36 shadow-md bg-slate-700 absolute p-2 border-2 border-slate-800" >
            <button type="button" class="text-white hover:text-gray-400" on:click={on_edit}>Edit</button>
            {#if $settings.chat.chat_tabs.length > 1 }
                <button type="button" class="text-white hover:text-gray-400" on:click={on_delete}>Delete</button>
            {/if}
        </div>
    {/if}
    <EditModal bind:show_edit_modal={show_edit_modal} {chat_tab} on:save={on_modal_save} {index}/>
</div>

<style>
    .active-tab {
        background-color: rgba(7, 56, 76, 1.0);
    }
</style>