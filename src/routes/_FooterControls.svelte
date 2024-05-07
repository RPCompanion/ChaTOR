
<script lang="ts">
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

    function on_checked(event: CustomEvent<boolean>) {
        always_on_top = event.detail;
    }

</script>

<div class="z-10 absolute bottom-0 left-0 w-full grid grid-cols-2 px-1">
    <div>
        <Checkbox on:checked={on_checked}>Always on top</Checkbox>
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