
<script lang="ts">
    import { toast } from "@zerodevx/svelte-toast";
    import { custom_emotes, type ICustomEmote } from "./network/custom_emote";
    import { submit_post } from "./network";
    import SmallButton from "./buttons/SmallButton.svelte";

    async function on_emote_click(emote: ICustomEmote) {

        let response = await submit_post("ButtonEmote", [emote.emote]);
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
        }

    }

</script>

<div class="bg-gray-500 text-white text-xl text-center border-t-2 border-b-2 border-slate-500">Emotes</div>
<div class="flex flex-row flex-wrap gap-2 max-h-56 overflow-y-auto">
    {#each $custom_emotes as emote}
        <SmallButton on:click={() => { on_emote_click(emote); }}>{emote.emote_name}</SmallButton>
    {/each}
</div>

