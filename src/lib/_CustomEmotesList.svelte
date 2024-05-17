
<script lang="ts">
    import { toast } from "@zerodevx/svelte-toast";
    import { custom_emotes, type ICustomEmote } from "./network/custom_emote";
    import { submit_post } from "./network";

    function on_emote_click(emote: ICustomEmote) {

        let response = submit_post("ButtonEmote", [emote.emote]);
        if (response.is_error()) {
            toast.push(response.unwrap_error());
        }

    }

</script>

<div class="bg-gray-500 text-white text-xl text-center border-t-2 border-b-2 border-slate-500">Emotes</div>
<div class="flex flex-row flex-wrap gap-2 max-h-56 overflow-y-auto">
    {#each $custom_emotes as emote}
        <button type="button" class="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500" on:click={() => { on_emote_click(emote); }}>{emote.emote_name}</button>
    {/each}
</div>

