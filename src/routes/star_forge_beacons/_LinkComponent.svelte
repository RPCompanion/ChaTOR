
<script lang="ts">

    export let href = "";
    export let title = undefined;
    export let text = "";

    let image_link = false;

    async function check_image() {

        let image = new Image();
        image.src = href;
        image.onload = function() {
            image_link = true;
        }

    }

    check_image();

</script>

{#if image_link}
    <img src={href} {title} alt={text} />
{:else}
    <div>{href}</div>
{/if}