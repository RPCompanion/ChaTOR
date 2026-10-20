import { create } from 'zustand';
import type { IServer } from '../lib/api/system';
import type { AuthStatus } from '../lib/api/account';

interface AccountStore {
    /** Set from Rust at startup (see api_url in lib/api.ts). */
    apiBase: string;
    auth: AuthStatus;
    signingIn: boolean;
    servers: IServer[];
    setApiBase: (apiBase: string) => void;
    setAuth: (auth: AuthStatus) => void;
    setSigningIn: (signingIn: boolean) => void;
    setServers: (servers: IServer[]) => void;
}

export const useAccountStore = create<AccountStore>()((set) => ({
    apiBase: "https://api.rpcompanion.com",
    auth: { state: "unknown" },
    signingIn: false,
    servers: [],
    setApiBase: (apiBase) => set({ apiBase }),
    setAuth: (auth) => set({ auth }),
    setSigningIn: (signingIn) => set({ signingIn }),
    setServers: (servers) => set({ servers }),
}));
