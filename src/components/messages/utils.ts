
import { fetch_content } from "../../lib/network";
import { Result, Ok } from "../../lib/result";

var cache: { [key: string]: string } = {};

export function fetch_item(item_id: bigint, callback: (result: Result<string, string>) => void) {

    if (cache[item_id.toString()]) {
        callback(Ok(cache[item_id.toString()]));
        return;
    }

    fetch_content(`https://swtor.jedipedia.net/en/itm/${item_id}`, (result) => {

        if (result.is_ok()) {

            let parser  = new DOMParser();
            let doc     = parser.parseFromString(result.unwrap(), 'text/html');
            let section = doc.getElementsByClassName("con-inv")[0];
            cache[item_id.toString()] = section.outerHTML;
            callback(Ok(section.outerHTML));

        } else {

            callback(result);

        } 

    });

}