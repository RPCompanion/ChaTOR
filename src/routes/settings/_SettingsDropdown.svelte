
<script lang="ts">
    export let options: string[];
    export let choosen_option: string | undefined = undefined
</script>

<select name="characters" class="w-1/2" bind:value={choosen_option}>
    {#each options as option}
        <option value={option}>{option}</option>
    {/each}
</select>