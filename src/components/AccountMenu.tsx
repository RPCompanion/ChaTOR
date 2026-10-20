import React, { useState } from "react";
import { CircleNotch, CloudSlash, DiscordLogo, Prohibit, UserCircle } from "@phosphor-icons/react";
import { useAccountStore } from "../store/useAccountStore";
import { add_navbar_callback, trigger_navbar_callbacks } from "../lib/navbar/navbar";
import { cancel_sign_in, describe_ban, refresh_auth, sign_in, sign_out } from "../lib/api/account";

const MENU_ID = "account";

/** Navbar entry: "Sign in", or the signed-in account with a menu. */
export default function AccountMenu() {
    const auth = useAccountStore((s) => s.auth);
    const signingIn = useAccountStore((s) => s.signingIn);
    const [open, setOpen] = useState(false);

    add_navbar_callback(MENU_ID, () => setOpen(false));

    function toggle_menu() {
        trigger_navbar_callbacks(MENU_ID);
        setOpen((v) => !v);
    }

    function menu_action(action: () => void) {
        setOpen(false);
        action();
    }

    if (signingIn) {
        return (
            <button type="button" className="nav-item" onClick={cancel_sign_in} title="Waiting for Discord. Click to cancel.">
                <CircleNotch size={16} className="animate-spin" />
                <span>Waiting for Discord</span>
            </button>
        );
    }

    switch (auth.state) {
        case "unknown":
            return null;

        case "signed_out":
            return (
                <button type="button" className="nav-item" onClick={() => sign_in()} title="Sign in with Discord">
                    <DiscordLogo size={18} />
                    <span>Sign in</span>
                </button>
            );

        case "offline":
            return (
                <button type="button" className="nav-item text-ink-300" onClick={() => refresh_auth()} title="Could not reach the ChaTOR server. Click to retry.">
                    <CloudSlash size={18} />
                    <span>Offline</span>
                </button>
            );

        case "banned":
            return (
                <div className="relative flex items-stretch">
                    <button type="button" className="nav-item text-danger-400" onClick={toggle_menu} aria-haspopup="menu" aria-expanded={open}>
                        <Prohibit size={18} />
                        <span>Banned</span>
                    </button>
                    {open && (
                        <div role="menu" className="panel panel-glass absolute top-11 right-0 w-64 p-1 flex flex-col">
                            <p className="px-3 py-2 text-sm text-ink-200">{describe_ban(auth.ban)}</p>
                            <button type="button" role="menuitem" className="menu-item" onClick={() => menu_action(sign_in)}>
                                Sign in again
                            </button>
                        </div>
                    )}
                </div>
            );

        case "signed_in": {
            const identity = auth.account.identities[0];
            const name = identity?.display_name ?? "Account";
            return (
                <div className="relative flex items-stretch">
                    <button type="button" className="nav-item normal-case tracking-normal" onClick={toggle_menu} aria-haspopup="menu" aria-expanded={open}>
                        {identity?.avatar_url ? (
                            <img src={identity.avatar_url} alt="" referrerPolicy="no-referrer" className="w-6 h-6 rounded-full border border-holo-500/40" />
                        ) : (
                            <UserCircle size={22} />
                        )}
                        <span className="max-w-32 truncate">{name}</span>
                    </button>
                    {open && (
                        <div role="menu" className="panel panel-glass absolute top-11 right-0 w-56 p-1 flex flex-col">
                            <div className="px-3 py-2">
                                <div className="eyebrow">Signed in with Discord</div>
                                <div className="text-ink-100 truncate">{name}</div>
                                {!auth.persisted && (
                                    <div className="text-xs text-ink-300 mt-1">For this session only: your system keyring is unavailable.</div>
                                )}
                            </div>
                            <div className="holo-line mx-2 my-1"></div>
                            <button type="button" role="menuitem" className="menu-item" onClick={() => menu_action(() => sign_out(false))}>
                                Sign out
                            </button>
                            <button type="button" role="menuitem" className="menu-item" onClick={() => menu_action(() => sign_out(true))}>
                                Sign out on all devices
                            </button>
                        </div>
                    )}
                </div>
            );
        }
    }
}
