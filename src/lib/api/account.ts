import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import { useAccountStore } from "../../store/useAccountStore";

// Sign-in runs in Rust (src-tauri/src/auth.rs): the session token stays in the OS credential
// store and never reaches the webview. These calls only see the resulting status.

export interface IIdentity {
    provider: string;
    display_name: string | null;
    avatar_url: string | null;
}

export interface IAccount {
    account_id: string;
    created_at: string;
    identities: IIdentity[];
}

export interface IBan {
    reason: string;
    /** null: permanent */
    expires_at: string | null;
}

export type AuthStatus =
    | { state: "unknown" }
    | { state: "signed_out" }
    | { state: "signed_in"; account: IAccount; persisted: boolean }
    | { state: "offline" }
    | { state: "banned"; ban: IBan };

export interface IAuthError {
    code: string;
    message: string;
    ban?: IBan | null;
}

export function describe_ban(ban: IBan): string {
    if (ban.expires_at === null) {
        return `This account is banned: ${ban.reason}`;
    }
    return `This account is banned until ${new Date(ban.expires_at).toLocaleString()}: ${ban.reason}`;
}

/** Checks the stored session with the server. */
export async function refresh_auth() {
    try {
        useAccountStore.getState().setAuth(await invoke<AuthStatus>("auth_status"));
    } catch (e) {
        console.log(e);
        useAccountStore.getState().setAuth({ state: "offline" });
    }
}

// Starting again cancels the previous attempt; only the latest one may update the store.
let sign_in_attempt = 0;

/** Opens Discord in the browser and waits for the user to approve (or cancel). */
export async function sign_in() {
    const attempt = ++sign_in_attempt;
    useAccountStore.getState().setSigningIn(true);

    try {
        const status = await invoke<AuthStatus>("auth_sign_in");
        if (attempt !== sign_in_attempt) {
            return;
        }
        useAccountStore.getState().setAuth(status);
        if (status.state === "signed_in" && !status.persisted) {
            toast.warn("Signed in for this session only: ChaTOR could not save the sign-in to your system's keyring.");
        }
    } catch (e) {
        if (attempt !== sign_in_attempt) {
            return;
        }
        const error = e as IAuthError;
        if (error.ban) {
            useAccountStore.getState().setAuth({ state: "banned", ban: error.ban });
            toast.error(describe_ban(error.ban));
        } else if (error.code !== "cancelled") {
            toast.error(error.message ?? String(e));
        }
    } finally {
        if (attempt === sign_in_attempt) {
            useAccountStore.getState().setSigningIn(false);
        }
    }
}

export function cancel_sign_in() {
    invoke("auth_cancel_sign_in").catch(console.log);
}

/** `all`: end every session of the account, on every device. */
export async function sign_out(all: boolean = false) {
    try {
        useAccountStore.getState().setAuth(await invoke<AuthStatus>("auth_sign_out", { all }));
    } catch (e) {
        console.log(e);
    }
}
