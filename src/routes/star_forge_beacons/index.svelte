

<script lang="ts">
    import PageFormatting from "../../components/_PageFormatting.svelte";
    import { get_star_forge_beacons, type IStarForgeBeacon } from "../../lib/api/star_forge_beacons";
    import { toast } from "@zerodevx/svelte-toast";

    let beacons: IStarForgeBeacon[] = [];

    async function get_beacons() {

        let response = await get_star_forge_beacons();
        if (response.is_error()) {
            toast.push(response.unwrap_error(), { theme: { "--toastBackground": "red" } });
        } else {
            beacons = response.unwrap();
        }

    }

    get_beacons();
    
</script>

<PageFormatting title="Star Forge Beacons">
    <div class="flex flex-col gap-4">
        {#each beacons as beacon}
            <div class="bg-white p-2 rounded-md">
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
                </div>
                {beacon.message}
                <div>
                    {#each beacon.attachments as attachment}
                        <img src={attachment} class="" alt="attachment"/>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</PageFormatting>