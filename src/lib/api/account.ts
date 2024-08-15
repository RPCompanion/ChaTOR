
import { invoke } from "@tauri-apps/api";
import { writable } from "svelte/store";

export interface IAccount {
    account_token: string;
}

export const account_token = writable<string | null>(null);
export const session_token = writable<string | null>(null);

function init_session() {

}

export function init_account() {

    invoke("get_account")
        .then((response) => {
            account_token.set((response as IAccount).account_token);
        })
        .catch((error) => {

        })
        .finally(() => {
            init_session();
        });

}