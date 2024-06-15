
<script lang="ts">
    
    import { fade } from "svelte/transition";
    import { restore_todays_messages } from "../network/swtor_message/swtor_chat_tab_messages";
    import { ArrowClockwise } from "phosphor-svelte";

    let show_restore_button: boolean = true;

    function on_restore_posts() {

        show_restore_button = false;
        restore_todays_messages();

    }

</script>

{#if show_restore_button}
    <button out:fade="{{ duration: 250 }}" class="text-3xl text-white hover:text-gray-400 cursor-pointer" on:click={on_restore_posts}>
        <ArrowClockwise/>
    </button>
{/if}