
<script lang="ts">
    
    import { fade } from "svelte/transition";
    import { show_restore_posts_button } from "./chat_log_window_store";
    import { restore_todays_messages } from "../network/swtor_message/swtor_chat_tab_messages";
    import { ArrowClockwise } from "phosphor-svelte";
    import Tooltip from "../../components/_Tooltip.svelte";

    let restore_posts_button: HTMLButtonElement;

    function on_restore_posts() {
        $show_restore_posts_button = false;
        restore_todays_messages();
    }

</script>

{#if $show_restore_posts_button}
    <div class="flex flex-row gap-1" out:fade="{{ duration: 250 }}">
        <Tooltip tooltip_text="Restore today's posts" placement="right">
            <button bind:this={restore_posts_button} 
                class="text-3xl text-white hover:text-gray-400 cursor-pointer" 
                on:click={on_restore_posts}><ArrowClockwise/>
            </button>
        </Tooltip>
    </div>
{/if}