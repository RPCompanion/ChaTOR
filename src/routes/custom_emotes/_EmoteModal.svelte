
<script lang="ts">

    import { createEventDispatcher } from "svelte";
    import { fly } from "svelte/transition";
    import { toast } from "@zerodevx/svelte-toast";
    import { GAME_MESSAGE_MAXIMUM } from "../../lib/messages";
    import { Result } from "../../lib/result";

    import { create_custom_emote } from "../../lib/network/custom_emote";

    export let show_modal: boolean = false;

    const dispatch = createEventDispatcher();

    let emote_name: string = "";
    let emote: string = "";

    function clear_vars() {
            
        emote_name = "";
        emote = "";

    }

    function on_cancel() {

        clear_vars();
        dispatch("cancel");
        
    }

    function validate_emote(): Result<[], string> {

        if (emote.length > GAME_MESSAGE_MAXIMUM) {
            return Result.error("Emote is too long.");
        };

        if (emote_name.length == 0) {
            return Result.error("Emote name is empty.");
        }

        if (emote.length == 0) {
            return Result.error("Emote is empty.");
        }

        return Result.ok([]);

    }

    function on_save() {

        let validation = validate_emote();

        if (validation.is_err()) {
            toast.push(validation.unwrap_err());
            return;
        }

        create_custom_emote(emote_name, emote);
        clear_vars();
        dispatch("save");

    }

</script>

{#if show_modal}
    <div class="w-2/3 bg-slate-800 h-32 rounded-md modal shadow-md" transition:fly|local={{ duration: 500, y: -500 }}>
        <div class="h-8"></div>
        <div class="flex flex-col w-full gap-2 justify-center items-center">
            <form class="flex flex-row gap-2 w-4/5" on:submit|preventDefault={on_save}>
                <input type="text" name="EmoteName" autocomplete="off" placeholder="Emote Name" class="w-1/2 px-1 text-xl outline-none" bind:value={emote_name}/>
                <input type="text" name="UniqueEmote" autocomplete="off" placeholder="Emote" class="w-1/2 px-1 text-xl outline-none" class:outline-red-500={emote.length > GAME_MESSAGE_MAXIMUM} bind:value={emote}/>
                <button type="submit" class="hidden">Submit</button>
            </form>
            <div class="flex flex-row gap-2">
                <button type="button" class="bg-slate-700 text-white text-xl px-2 rounded-md" on:click={on_save}>Save</button>
                <button type="button" class="bg-slate-700 text-white text-xl px-2 rounded-md" on:click={on_cancel}>Cancel</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: calc(33% - 8rem/2);
        left: calc(50% - 33%);
        z-index: 1000;
    }
</style>