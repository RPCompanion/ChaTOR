
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "../result";
import { Option, Some, None } from "../option";

export interface ICustomChannel {
    custom_channel_id?: number;
    channel_name: string;
    channel_number: number;
}

export const custom_channels = writable<ICustomChannel[]>([]);

export function get_custom_channel_number(channel_name: string): Option<number> {

    let t_custom_channels = get(custom_channels);
    let channel = t_custom_channels.find((x) => x.channel_name === channel_name);

    if (channel) {
        return Some(channel.channel_number);
    }

    return None();

}

export function init_custom_channels() {

    invoke("get_all_custom_channels").then((result) => {
        let temp = result as ICustomChannel[];
        custom_channels.set(temp);
    });

}

export async function custom_channel_save(custom: ICustomChannel): Promise<Result<[], string>> {

    let returned_channel: ICustomChannel;
    try {

        returned_channel = await invoke("save_custom_channel", { customChannel: custom }) as ICustomChannel;

    } catch (e) {

        let temp = e as string;
        return Err(temp);

    }

    if (custom.custom_channel_id) {

        // updating existing
        let t_custom_channels = get(custom_channels);
        let index = t_custom_channels
            .findIndex((x) => x.custom_channel_id === custom.custom_channel_id);

        if (index != -1) {

            t_custom_channels[index] = custom;
            custom_channels.set(t_custom_channels);

        } else {

            return Err("Custom channel not found");

        }

    } else {

        // adding new
        custom_channels.update((store) => {
            store.push(returned_channel);
            return store;
        });

    }

    return Ok([]);

}

export async function custom_channel_delete(custom: ICustomChannel): Promise<Result<[], string>> {

    try {

        await invoke("delete_custom_channel", { customChannel: custom });

        let t_custom_channels = get(custom_channels);
        let index = t_custom_channels
            .findIndex((x) => x.custom_channel_id === custom.custom_channel_id);

        if (index != -1) {

            t_custom_channels.splice(index, 1);
            custom_channels.set(t_custom_channels);

        } else {

            return Err("Custom channel not found");

        }

        return Ok([]);

    } catch (e) {

        let temp = e as string;
        return Err(temp);

    }

}