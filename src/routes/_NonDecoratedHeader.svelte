
<script lang="ts">
    import { settings } from "../lib/network/settings";
    import { appWindow } from "@tauri-apps/api/window";
    import { X, Square, Minus, ArrowSquareDownLeft  } from "phosphor-svelte";

    let is_maximized = false;
    function on_close() {
        appWindow.close();
    }

    function on_minimize() {
        appWindow.minimize();
    }

    async function on_maximize() {

        if (await appWindow.isMaximized()) {

            appWindow.unmaximize();
            is_maximized = false;
            return;

        }

        await appWindow.maximize();
        is_maximized = true;

    }

</script>

<body>
    <div 
        data-tauri-drag-region 
        class="h-8 bg-slate-700 class flex flex-row gap-1 fixed top-0 left-0 right-0 select-none justify-end z-50"
        class:border-x={!$settings.app.show_window_decorations}
        class:border-t={!$settings.app.show_window_decorations}
        class:border-slate-600={!$settings.app.show_window_decorations}
        >
        <button type="button" class="text-white hover:bg-slate-800 px-1" on:click={on_minimize}>
            <Minus size={22}/>
        </button>
        <button type="button" class="text-white hover:bg-slate-800 px-1" on:click={on_maximize}>
            {#if is_maximized}
                <ArrowSquareDownLeft size={22}/>
            {:else}
                <Square size={22}/>
            {/if}
        </button>
        <button type="button" class="text-white hover:bg-slate-800 px-1" on:click={on_close}>
            <X size={22}/>
        </button>
    </div>
</body>