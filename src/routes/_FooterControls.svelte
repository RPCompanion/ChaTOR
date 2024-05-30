
<script lang="ts">
    import { settings } from '../lib/network/settings';
    import { appWindow } from '@tauri-apps/api/window';
    import Checkbox from '../lib/Checkbox.svelte';
    import { GithubLogo, DiscordLogo } from 'phosphor-svelte'
    import { open_link } from '../lib/network';

    let always_on_top: boolean = false;

    $: if (always_on_top) {
        appWindow.setAlwaysOnTop(true);
    } else {
        appWindow.setAlwaysOnTop(false);
    }
    
</script>

<div class="relative w-full grid grid-cols-2 px-1">
    <div>
        <Checkbox bind:checked={$settings.app.always_on_top}>Always on top</Checkbox>
    </div>
    <div class="flex flex-row-reverse gap-2">
        <!--
            <button class="cursor-pointer bg-slate-500 rounded-md px-2" on:click={() => { open_link("https://discord.gg/2TPvYF79yz"); }}>
                <DiscordLogo size={32} color="white" />
            </button>
        -->
        <button class="cursor-pointer bg-slate-500 rounded-md px-2" on:click={() => { open_link("https://github.com/Davenport-Physics/SWTOR-Chat"); }}>
            <GithubLogo size={32} color="white"/>
        </button>
    </div>
</div>