
import { invoke } from "@tauri-apps/api";
import { Result, Ok, Err } from "./result";

interface GameData {
    name: string[];
    global_ids: bigint[];
}

var game_data: GameData = { name: [], global_ids: [] };

export async function get_name_by_global_id(global_id: bigint): Promise<Result<string, string>> {

    let index = game_data.global_ids.indexOf(global_id);
    if (index != -1) {
        return Ok(game_data.name[index]);
    }

    try {

        let response = await invoke("get_name_by_global_id", { globalId: global_id.toString() });

        game_data.name.push(response as string);
        game_data.global_ids.push(global_id);

        return Ok(response as string);

    } catch (error) {

        return Err(error as string);

    }

}