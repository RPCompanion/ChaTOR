import { invoke } from "@tauri-apps/api/core";
import { useAccountStore } from "../../store/useAccountStore";
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

async function login() {
    const { accountToken } = useAccountStore.getState();
    if (accountToken === null) {
        return;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const request = new Request(API_ENDPOINTS.account.login.url, {
        method: API_ENDPOINTS.account.login.type,
        body: JSON.stringify({ account_token: accountToken }),
        headers,
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
            return;
        }
        const new_session: ISession = await response.json();
        useAccountStore.getState().setSessionToken(new_session.session_token);
    } catch (e) {
        console.log(e);
    }
}

async function create_account() {
    const request = new Request(API_ENDPOINTS.account.create.url, {
        method: API_ENDPOINTS.account.create.type,
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
            return;
        }
        const new_account: INewAccount = await response.json();
        useAccountStore.getState().setAccountToken(new_account.account_token);
        useAccountStore.getState().setSessionToken(new_account.session_token);
        invoke("save_account", { account: { account_token: new_account.account_token } });
    } catch (e) {
        console.log(e);
    }
}

export function init_account() {
    invoke("get_account")
        .then((response) => {
            useAccountStore.getState().setAccountToken((response as IAccount).account_token);
            login();
        })
        .catch(() => {
            create_account();
        });
}
