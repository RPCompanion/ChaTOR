
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Result, Ok, Err } from "./result";
import { useAppStore } from "../store/useAppStore";

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

/// The backend emits `game_data_ready` once names from the installed game are loaded (after
/// the shipped ones); links still showing "<Loading>" then look their names up again.
export function init_game_data_listener(): () => void {
    const unlisten = listen("game_data_ready", () => useAppStore.getState().bumpGameDataVersion());
    return () => { unlisten.then((f) => f()); };
}

export interface GameStat {
    name: string;
    value: number;
}

export interface GameModule {
    id: string;
    name: string | null;
    level: number | null;
    quality: string;
    stats: GameStat[];
}

/// Tooltip data read from the installed game (see swtor-gamedata's tooltip.rs). `quality` is a
/// colour key (standard, premium, prototype, artifact, legendary, legacy, quest, currency,
/// custom, mission, none, ...); `icon_url` is a PNG data URL.
export interface GameItemTooltip {
    kind: "item";
    id: string;
    name: string | null;
    quality: string;
    icon_url: string | null;
    cartel_market: boolean;
    count: number | null;
    roll_level: number | null;
    binding: string | null;
    unique: boolean;
    armor_type: string | null;
    durability: number | null;
    stats: GameStat[];
    modifications: { slot: string; module: GameModule | null }[];
    required_level: number | null;
    abilities: { trigger: "use" | "equip"; text: string }[];
    description: string | null;
}

export interface GameAchievementTooltip {
    kind: "achievement";
    id: string;
    name: string | null;
    description: string | null;
    icon_url: string | null;
    prestige: number | null;
}

export type GameTooltip = GameItemTooltip | GameAchievementTooltip;

/// Fails when the game data is not available (game not found / not loaded yet).
export async function get_game_tooltip(global_id: bigint): Promise<Result<GameTooltip, string>> {
    try {
        return Ok(await invoke<GameTooltip>("get_game_tooltip", { globalId: global_id.toString() }));
    } catch (error) {
        return Err(error as string);
    }
}
