
<script lang="ts">
    import { appWindow } from '@tauri-apps/api/window';
    let always_on_top: boolean = false;

    $: if (always_on_top) {
        appWindow.setAlwaysOnTop(true);
    } else {
        appWindow.setAlwaysOnTop(false);
    }

</script>

<div class="z-10 absolute bottom-2 left-2 flex flex-row gap-2">
    <label class="text-white text-xl bg-slate-900 rounded-md shadow-lg p-1">
        <input type="checkbox" bind:checked={always_on_top} class="ml-2 scale-150"/>
        Always on top
    </label>
</div>