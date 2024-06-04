
import { writable } from "svelte/store";
import { type IListElem } from "../../components/select_list";

var player_set: Set<string> = new Set();
export const players_filter = writable<IListElem<string>[]>([]);

export function add_player(player: string) {
    
    if (player_set.has(player)) {
        return;
    }

    player_set.add(player);
    players_filter.update((players) => {

        players.push({value: player, selected: true});
        players = players.toSorted((a, b) => a.value.localeCompare(b.value));

        return players;
        
    });

}