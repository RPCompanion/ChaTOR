
<script lang="ts">
    import { appWindow } from "@tauri-apps/api/window";
    import { X, Square, Minus  } from "phosphor-svelte";

    function on_close() {
        appWindow.close();
    }

    function on_minimize() {
        appWindow.minimize();
    }

    function on_maximize() {
        appWindow.maximize();
    }

</script>

<body>
    <div data-tauri-drag-region class="h-8 bg-slate-700 class flex flex-row gap-1 fixed top-0 left-0 right-0 select-none justify-end ">
        <button type="button" class="text-white hover:bg-slate-800" on:click={on_minimize}>
            <Minus size={24}/>
        </button>
        <button type="button" class="text-white hover:bg-slate-800" on:click={on_maximize}>
            <Square size={24}/>
        </button>
        <button type="button" class="text-white hover:bg-slate-800" on:click={on_close}>
            <X size={24}/>
        </button>
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