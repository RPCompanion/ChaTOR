
<script lang="ts">
    import { toast } from "@zerodevx/svelte-toast";
    import { Result, Ok, Err } from "../result";
    import { fly } from "svelte/transition";
    import type { IChatTab } from "../network/settings";

    export let chat_tab: IChatTab = { name: "", channels: [] }
    export let show_edit_modal: boolean;

    let t_chat_tab: IChatTab = JSON.parse(JSON.stringify(chat_tab));

    function on_cancel() {
        show_edit_modal = false;
    }

    function validate_chat_tab_name(): Result<[], string> {

        if (t_chat_tab.name.length == 0) {
            return Err("Chat tab name cannot be empty");
        }
        return Ok([]);

    }

    function on_save() {
        
        t_chat_tab.name = t_chat_tab.name.trim();

        let result = validate_chat_tab_name();
        if (result.is_error()) {
            toast.push(result.unwrap_error(), { theme: { '--toastBarBackground': 'red' } });
            return;
        }

        show_edit_modal = false;

    }

</script>

{#if show_edit_modal}
    <div transition:fly|local="{{ duration: 500, y: -500 }}" class="w-72 min-h-48 bg-slate-700 p-2 border-2 border-slate-800 fixed z-20 modal-position flex flex-col gap-1">
        <input type="text" bind:value={t_chat_tab.name} maxlength="12" class=" outline-none border-2 border-slate-800 text-xl" placeholder="tab name">
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
