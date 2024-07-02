
<script lang="ts">
    import { open_link } from "../../lib/network";

    function show_forum_link() {
        open_link("https://forums.swtor.com/topic/609549-how-to-use-custom-chat-channels/");
    }

</script>

<div class="text-center text-lg">
    <p class="text-white">This page allows you to specify any custom channels you have joined in game.</p>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span class="text-white">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        For more information on how custom channels work, see <span class="text-red-400 cursor-pointer" on:click={show_forum_link}>here</span>
    </span>
    <p class="text-white text-sm">The channel name should match the in game channel that you joined.</p>
</div>