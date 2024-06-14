
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "../result";

export interface IDateTag {
    date: string;
    favourite: boolean;
    tags: string[];
}

export function date_tag_new(date: string): IDateTag {

    return {
        date: date,
        favourite: false,
        tags: []
    }
    
}

export async function get_all_date_tag_favourites(): Promise<Result<IDateTag[], string>> {

    let result;
    try {
        result = await invoke("get_all_date_tag_favourites");
    } catch(e) {
        return Err(e as string)
    }

    return Ok(result as IDateTag[]);

}

export async function save_date_tag(date_tag: IDateTag): Promise<Result<[], string>> {

    try {
        await invoke("save_date_tag", { dateTag: date_tag });
    } catch(e) {
        return Err(e as string)
    }

    return Ok([]);

}