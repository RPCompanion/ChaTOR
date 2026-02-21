import { invoke } from "@tauri-apps/api/core";
import { Result, Ok, Err } from "../result";
import { Option, Some, None } from "../option";
import { useChannelStore } from "../../store/useChannelStore";

export interface ICustomChannel {
    custom_channel_id?: number;
    channel_name: string;
    channel_number: number;
}

export function get_custom_channel_number(channel_name: string): Option<number> {
    const channels = useChannelStore.getState().customChannels;
    const channel = channels.find((x) => x.channel_name === channel_name);
    if (channel) {
        return Some(channel.channel_number);
    }
    return None();
}

export function init_custom_channels() {
    invoke("get_all_custom_channels").then((result) => {
        useChannelStore.getState().setCustomChannels(result as ICustomChannel[]);
    });
}

export async function custom_channel_save(custom: ICustomChannel): Promise<Result<[], string>> {
    let returned_channel: ICustomChannel;
    try {
        returned_channel = await invoke("save_custom_channel", { customChannel: custom }) as ICustomChannel;
    } catch (e) {
        return Err(e as string);
    }

    const store = useChannelStore.getState();
    const channels = store.customChannels;

    if (custom.custom_channel_id) {
        const index = channels.findIndex((x) => x.custom_channel_id === custom.custom_channel_id);
        if (index !== -1) {
            store.updateCustomChannel(custom);
        } else {
            return Err("Custom channel not found");
        }
    } else {
        store.addCustomChannel(returned_channel);
    }

    return Ok([]);
}

export async function custom_channel_delete(custom: ICustomChannel): Promise<Result<[], string>> {
    try {
        await invoke("delete_custom_channel", { customChannel: custom });
        const channels = useChannelStore.getState().customChannels;
        const found = channels.find((x) => x.custom_channel_id === custom.custom_channel_id);
        if (found) {
            useChannelStore.getState().removeCustomChannel(custom.custom_channel_id!);
        } else {
            return Err("Custom channel not found");
        }
        return Ok([]);
    } catch (e) {
        return Err(e as string);
    }
}
