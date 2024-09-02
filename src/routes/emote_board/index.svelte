
<script lang="ts">

    import { toast } from "@zerodevx/svelte-toast";
    import { custom_emotes, type ICustomEmote } from "../../lib/network/custom_emote";
    import VariableSizeButton from "../../lib/buttons/VariableSizeButton.svelte";
    import { submit_post } from "../../lib/network";
    import PageFormatting from "../../components/_PageFormatting.svelte";
    import type { Result } from "../../lib/result";

    function on_emote_click(emote: ICustomEmote) {

        submit_post("ButtonEmote", [emote.emote], (result: Result<[], string>) => {

            if (result.is_err()) {
                toast.push(result.unwrap_err(), { theme: { "--toastBackground": "red" } });
            }

        });

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