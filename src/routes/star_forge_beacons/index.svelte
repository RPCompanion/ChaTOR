

<script lang="ts">
    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { get_star_forge_beacons, type IStarForgeBeacon } from "../../lib/api/star_forge_beacons";
    import { toast } from "@zerodevx/svelte-toast";
    import { get_time_elapsed_since } from "../../lib/utils";
    import SvelteMarkdown from "svelte-markdown";
    import LinkComponent from "./_LinkComponent.svelte";

    let beacons: IStarForgeBeacon[] = [];

    async function get_beacons() {

        let response = await get_star_forge_beacons();
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
            return;
        }

        beacons = response.unwrap();

    }

    function get_parsed_date(time: string): string {
        return get_time_elapsed_since(new Date(time));
    }

    get_beacons();
    
</script>

<PageFormatting title="Star Forge Beacons">
    <div class="flex flex-col gap-4">
        {#each beacons as beacon}
            <div class="bg-white p-2 rounded-md shadow-md">
                <div class="flex flex-row gap-1">
                    {#if beacon.avatar_url != undefined}
                        <img src={beacon.avatar_url} class="w-12 h-12 rounded-full" alt="avatar_url"/>
                    {/if}
                    {#if beacon.global_name != undefined}
                        <div>{beacon.global_name}</div>
                        <div>({beacon.name})</div>
                    {:else}
                        <div>{beacon.name}</div>
                    {/if}
                    <div><b>{get_parsed_date(beacon.create_time)}</b></div>
                </div>

                <SvelteMarkdown source={beacon.message} renderers={{ link: LinkComponent }}/>

                <div class="flex flex-col gap-1">
                    {#each beacon.attachments as attachment}
                        <img src={attachment} class="" alt="attachment"/>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</PageFormatting>