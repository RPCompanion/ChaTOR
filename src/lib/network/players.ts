import { useChatLogStore } from "../../store/useChatLogStore";
import type { IListElem } from "../../components/select_list";

var player_set: Set<string> = new Set();

export function add_player(player: string) {
    if (player_set.has(player)) {
        return;
    }
    player_set.add(player);
    useChatLogStore.getState().updatePlayersFilter((players) => {
        const updated = [...players, { value: player, selected: true }];
        return updated.sort((a, b) => a.value.localeCompare(b.value));
    });
}
