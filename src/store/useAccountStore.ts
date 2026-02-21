import { create } from 'zustand';
import type { IServer } from '../lib/api/system';

interface AccountStore {
    accountToken: string | null;
    sessionToken: string | null;
    servers: IServer[];
    setAccountToken: (token: string | null) => void;
    setSessionToken: (token: string | null) => void;
    setServers: (servers: IServer[]) => void;
}

export const useAccountStore = create<AccountStore>()((set) => ({
    accountToken: null,
    sessionToken: null,
    servers: [],
    setAccountToken: (accountToken) => set({ accountToken }),
    setSessionToken: (sessionToken) => set({ sessionToken }),
    setServers: (servers) => set({ servers }),
}));
