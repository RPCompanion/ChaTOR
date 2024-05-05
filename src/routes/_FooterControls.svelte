
<script lang="ts">
    import { appWindow } from '@tauri-apps/api/window';
    import Checkbox from '../lib/Checkbox.svelte';

    let always_on_top: boolean = false;

    $: if (always_on_top) {
        appWindow.setAlwaysOnTop(true);
    } else {
        appWindow.setAlwaysOnTop(false);
    }

    function on_checked(event: CustomEvent<boolean>) {
        always_on_top = event.detail;
    }

</script>

<div class="z-10 absolute bottom-2 left-2 flex flex-row gap-2">
    <Checkbox on:checked={on_checked}>Always on top</Checkbox>
</div>