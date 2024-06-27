
import { Result, Ok, Err } from "../../lib/result";    

export const MIN_CHANNEL_NAME_LENGTH: number = 1;
export const MAX_CHANNEL_NAME_LENGTH: number = 16;

/** Mutates the channel name to remove any leading or trailing whitespace
 * 
 * */
export function channel_name_valid(channel_name: string): Result<[], string> {

    channel_name = channel_name.trim();

    if (channel_name.length == 0) {
        return Err("Channel name cannot be empty");
    }

    if (channel_name.length > MAX_CHANNEL_NAME_LENGTH) {
        return Err("Channel name cannot exceed 16 characters");
    }

    return Ok([]);

}