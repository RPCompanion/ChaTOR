
<script lang="ts">

    import { toast } from "@zerodevx/svelte-toast";
    import { custom_emotes, type ICustomEmote } from "../../lib/network/custom_emote";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { submit_post } from "../../lib/network";
    import PageFormatting from "../../components/_PageFormatting.svelte";

    async function on_emote_click(emote: ICustomEmote) {

        let response = await submit_post("ButtonEmote", [emote.emote]);
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
        }

    }

</script>


<PageFormatting title="Emote Board">
    <div class="flex flex-row flex-wrap gap-1 w-full justify-center">
        {#each $custom_emotes as emote}
            <div>
                <VariableSizeButton 
                    on:click={() => { on_emote_click(emote); }}
                    my_classes={emote.favourite ? "bg-yellow-500 text-black text-2xl px-2 rounded-md hover:text-white" : undefined}
                >{emote.emote_name}</VariableSizeButton>
            </div>
        {/each}
    </div>
</PageFormatting>