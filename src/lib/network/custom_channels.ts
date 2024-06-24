
import { writable, get } from "svelte/store";
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "../result";

export interface CustomChannel {
    custom_channel_id?: number;
    channel_name: string;
    channel_number: number;
}

export const custom_channels = writable<CustomChannel[]>([]);

export function init_custom_channels() {

    invoke("get_all_custom_channels").then((result) => {
        let temp = result as CustomChannel[];
        custom_channels.set(temp);
    });

}

export async function custom_channel_save(custom: CustomChannel): Promise<Result<[], string>> {

    let returned_channel: CustomChannel;
    try {

        returned_channel = await invoke("save_custom_channel", { customChannel: custom }) as CustomChannel;

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

export async function custom_channel_delete(custom: CustomChannel): Promise<Result<[], string>> {

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