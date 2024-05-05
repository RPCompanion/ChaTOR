
import { invoke } from "@tauri-apps/api";

export function init_hook() {
    invoke("start_swtor_hook");
}

export function submit_post(messages: string[]) {

    interface NewCharacterMessage {
        messages: string[];
    }

    let character_message: NewCharacterMessage = {
        messages: messages
    };

    invoke("submit_actual_post", { characterMessage: character_message});

}