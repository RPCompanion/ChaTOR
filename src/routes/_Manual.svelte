
<script lang="ts">

    let messages: string[] = [""];

    function delete_message(idx: number) {
        messages.splice(idx, 1);
        messages = messages;
    }

    function on_new_message() {
        messages.push("");
        messages = messages;
    }

</script>

<div class="flex flex-col gap-2 w-full p-10">
    {#each messages as message, idx}
        <div class="relative">
            <textarea class="w-full outline-none p-1 resize-none rounded-md border-2" class:border-red-500={message.length > 255} bind:value={message}/>
            <button class="absolute bg-slate-700 px-1 -right-2 -top-3 text-white" style="border-radius: 50%" on:click={() => { delete_message(idx); }}>X</button>
            <div class="absolute bottom-1 right-0">{message.length}/255</div>
        </div>
    {/each}
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm" on:click={on_new_message}>New</button>
    <button type="button" class="bg-slate-700 text-white rounded-sm shadow-sm">Post</button>
</div>