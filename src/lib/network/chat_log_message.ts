
/*

*/

import { SwtorMessage, type ISwtorMessage } from "./swtor_message";
export interface IChatLogMessage {
    chat_log_id: number;
    character_id: number;
    timestamp: string;
    message: ISwtorMessage;
}

export class ChatLogMessage {

    public readonly chat_log_id: number;
    public readonly character_id: number;
    public readonly timestamp: string;
    public readonly message: SwtorMessage;

    constructor(chat_log_message: IChatLogMessage) {
        this.chat_log_id  = chat_log_message.chat_log_id;
        this.character_id = chat_log_message.character_id;
        this.timestamp    = chat_log_message.timestamp;
        this.message      = new SwtorMessage(chat_log_message.message);

    }

}