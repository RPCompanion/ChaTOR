
import { invoke } from "@tauri-apps/api";
import { writable, get } from "svelte/store";
import { API_ENDPOINTS } from "../api";

export interface ISession {
    session_token: string;
}

export interface IAccount {
    account_token: string;
}

export interface INewAccount {
    account_token: string;
    session_token: string;
}

export const account_token = writable<string | null>(null);
export const session_token = writable<string | null>(null);

async function login() {

    if (get(account_token) == null) {
        return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    let request = new Request(API_ENDPOINTS.account.login.url, {
        method: API_ENDPOINTS.account.login.type,
        body: JSON.stringify({account_token: get(account_token)}),
        headers: headers
    })

    try {

        let response = await fetch(request);
        if (!response.ok) {
            return;
        }
        
        let new_session: ISession = await response.json();
        session_token.set(new_session.session_token);

    } catch (e) {
        console.log(e);
    }

}

async function create_account() {

    let request = new Request(API_ENDPOINTS.account.create.url, {
        method: API_ENDPOINTS.account.create.type,
    });

    try {

        let response = await fetch(request);
        if (!response.ok) {
            return;
        }
        let new_account: INewAccount = await response.json()
        account_token.set(new_account.account_token);
        session_token.set(new_account.session_token);
        invoke("save_account", {account: { account_token: new_account.account_token }});

    } catch (e) {
        console.log(e);
    }

}

export function init_account() {

    invoke("get_account")
        .then((response) => {
            account_token.set((response as IAccount).account_token);
            login();
        })
        .catch((e) => {
            create_account();
        });

}