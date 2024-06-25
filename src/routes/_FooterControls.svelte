
<script lang="ts">
    import { invoke } from '@tauri-apps/api';
    import { Heart } from 'phosphor-svelte';
    import { settings } from '../lib/network/settings';
    import { appWindow } from '@tauri-apps/api/window';
    import Checkbox from '../lib/Checkbox.svelte';
    import { GithubLogo, DiscordLogo, Folder } from 'phosphor-svelte'
    import { open_link } from '../lib/network';

    let version_string: string | undefined = undefined;

    $: if ($settings.app.always_on_top) {
        appWindow.setAlwaysOnTop(true);
    } else {
        appWindow.setAlwaysOnTop(false);
    }

    function open_db_dir() {
        invoke('open_db_dir');
    }

    function set_version_string() {
        invoke("get_version").then((response) => {
            version_string = 'v' + response as string;
        });
    }

    set_version_string();

</script>

{#if version_string != undefined}
    <div class="text-white text-xl text-end px-1">{version_string}</div>
{/if}
<div class="relative w-full grid grid-cols-2 px-1 pb-1">
    <div class="flex flex-row gap-1"> 
        <div class="flex flex-row gap-1">
            <span class="text-white text-xl">Made with</span>
            <Heart size={28} color="red"/>
            <span class="text-white text-xl">by emmadear</span>
        </div>
    </div>
    <div class="flex flex-row-reverse gap-1 ">
        <button class="cursor-pointer bg-slate-500 rounded-md px-2" on:click={() => { open_link("https://github.com/Davenport-Physics/SWTOR-Chat"); }}>
            <GithubLogo size={32} color="white"/>
        </button>
        <button class="cursor-pointer bg-slate-500 rounded-md px-2" on:click={() => { open_link("https://discord.gg/TwfBK94ree"); }}>
            <DiscordLogo size={32} color="white" />
        </button>
        <button class="cursor-pointer bg-slate-500 rounded-md px-2" on:click={open_db_dir}>
            <Folder size={32} color="white"/>
        </button>
        <Checkbox bind:checked={$settings.app.always_on_top}>Always on top</Checkbox>
    </div>
</div>