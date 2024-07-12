
import { fetch_content, fetch_jediapedia_content } from "../../lib/network";
import { Result, Ok } from "../../lib/result";

var cache: { [key: string]: string } = {};

export function fetch_item(global_id: bigint, callback: (result: Result<string, string>) => void) {

    common_fetch(global_id, "https://swtor.jedipedia.net/en/itm/", callback);

}

export function fetch_achievement(global_id: bigint, callback: (result: Result<string, string>) => void) {
    
    common_fetch(global_id, "https://swtor.jedipedia.net/en/ach/", callback);

}

function common_fetch(global_id: bigint, url: string, callback: (result: Result<string, string>) => void) {

    if (cache[global_id.toString()]) {
        callback(Ok(cache[global_id.toString()]));
        return;
    }

    fetch_jediapedia_content(global_id.toString(), `${url}/${global_id}`, (result) => {

        if (result.is_ok()) {

            cache[global_id.toString()] = result.unwrap();
            callback(Ok(result.unwrap()));

        } else {

            callback(result);

        } 

    });

}