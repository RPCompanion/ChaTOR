import { listen } from "@tauri-apps/api/event";
import { add_dice_roll_to_chat_tabs } from "./swtor_message/swtor_chat_tab_messages";
import { add_player } from "./players";

export interface IDiceRoll {
    timestamp: string;
    player_name: string;
    result_text: string;
}

export class DiceRoll {
    public readonly timestamp: string;
    public readonly player_name: string;
    public readonly result_text: string;

    constructor(dice_roll: IDiceRoll) {
        this.timestamp = new Date(dice_roll.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        this.player_name = dice_roll.player_name;
        this.result_text = dice_roll.result_text;
    }
}

export function init_dice_roll_listener() {
    console.log("[ROLL] Initializing dice roll listener");
    listen("dice_roll", (event: any) => {
        console.log("[ROLL] Received dice_roll event:", event.payload);
        const payload: IDiceRoll = event.payload;
        const roll = new DiceRoll(payload);
        console.log("[ROLL] Created DiceRoll:", roll);
        add_dice_roll_to_chat_tabs(roll);
        add_player(roll.player_name);
        console.log("[ROLL] Added to chat tabs and players");
    });
}
