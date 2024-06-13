
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "../result";

export interface DateTag {
    date: string;
    favourite: boolean;
    tags: string[];
}

export async function get_all_date_tag_favourites(): Promise<Result<DateTag[], string>> {

    let result;
    try {
        result = await invoke("get_all_date_tag_favourites");
    } catch(e) {
        return Err(e as string)
    }

    return Ok(result as DateTag[]);

}

export async function save_date_tag(date_tag: DateTag): Promise<Result<[], string>> {

    try {
        await invoke("save_date_tag", { dateTag: date_tag });
    } catch(e) {
        return Err(e as string)
    }

    return Ok([]);

}