import { create } from 'zustand';
import type { IServer } from '../lib/api/system';
import type { AuthStatus } from '../lib/api/account';

interface AccountStore {
    auth: AuthStatus;
    signingIn: boolean;
    servers: IServer[];
    setAuth: (auth: AuthStatus) => void;
    setSigningIn: (signingIn: boolean) => void;
    setServers: (servers: IServer[]) => void;
}

export const useAccountStore = create<AccountStore>()((set) => ({
    auth: { state: "unknown" },
    signingIn: false,
    servers: [],
    setAuth: (auth) => set({ auth }),
    setSigningIn: (signingIn) => set({ signingIn }),
    setServers: (servers) => set({ servers }),
}));
