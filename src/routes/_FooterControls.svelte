
<script lang="ts">
    import { appWindow } from '@tauri-apps/api/window';
    let always_on_top: boolean = false;

    $: if (always_on_top) {
        appWindow.setAlwaysOnTop(true);
    } else {
        appWindow.setAlwaysOnTop(false);
    }

</script>

<div class="z-10 absolute bottom-0 left-0 w-full">
    <label class="text-white text-xl">
        <input type="checkbox" bind:checked={always_on_top}/>
        Always on top
    </label>
</div>