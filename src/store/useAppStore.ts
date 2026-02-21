import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
import type { ISettings } from '../lib/network/settings';
import { default_settings } from '../lib/network/settings';
import type { LocalCharacterInfo } from '../lib/network/local_characters';

interface AppStore {
    settings: ISettings;
    chatLogActive: boolean;
    hookedIn: boolean;
    activeCharacter: LocalCharacterInfo | undefined;
    shownCharactersError: boolean;
    setSettings: (settings: ISettings) => void;
    updateSettings: (updater: (draft: ISettings) => void) => void;
    setChatLogActive: (v: boolean) => void;
    setHookedIn: (v: boolean) => void;
    setActiveCharacter: (c: LocalCharacterInfo | undefined) => void;
    setShownCharactersError: (v: boolean) => void;
}

export const useAppStore = create<AppStore>()(
    subscribeWithSelector((set) => ({
        settings: default_settings(),
        chatLogActive: false,
        hookedIn: false,
        activeCharacter: undefined,
        shownCharactersError: false,
        setSettings: (settings) => set({ settings }),
        updateSettings: (updater) => set((state) => ({ settings: produce(state.settings, updater) })),
        setChatLogActive: (chatLogActive) => set({ chatLogActive }),
        setHookedIn: (hookedIn) => set({ hookedIn }),
        setActiveCharacter: (activeCharacter) => set({ activeCharacter }),
        setShownCharactersError: (shownCharactersError) => set({ shownCharactersError }),
    }))
);
