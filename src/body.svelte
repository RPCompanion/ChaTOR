
<script lang="ts">
    import { X, CornersOut,   } from "phosphor-svelte";
</script>

<body>
    <div data-tauri-drag-region class="h-8 bg-slate-700 class flex flex-row fixed top-0 left-0 right-0 select-none justify-end ">
        <div class="titlebar-button hover:bg-slate-800" id="titlebar-minimize">
            <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize"/>
        </div>
        <div class="titlebar-button hover:bg-slate-800" id="titlebar-maximize">
            <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize"/>
        </div>
        <div class="titlebar-button hover:bg-slate-800" id="titlebar-close">
            <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div>
    </div>
</body>

<style>
    .titlebar-button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 30px;
        height: 30px;
    }
</style>