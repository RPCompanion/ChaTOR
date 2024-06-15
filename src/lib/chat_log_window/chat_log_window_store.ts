
import { writable } from "svelte/store";

export const active_chat_tab_index     = writable<number>(0);
export const show_restore_posts_button = writable<boolean>(true);