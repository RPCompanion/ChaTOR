
import { fetch_content } from "../../lib/network";
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

    fetch_content(`${url}/${global_id}`, (result) => {

        if (result.is_ok()) {

            let parser  = new DOMParser();
            let doc     = parser.parseFromString(result.unwrap(), 'text/html');
            let section = doc.getElementsByClassName("con-inv")[0];
            cache[global_id.toString()] = section.outerHTML
            callback(Ok(section.outerHTML));

        } else {

            callback(result);

        } 

    });

}