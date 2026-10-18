import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { produce } from 'immer';
import type { ISettings } from '../lib/network/settings';
import { default_settings } from '../lib/network/settings';
import type { LocalCharacterInfo } from '../lib/network/local_characters';

/// What the footer indicator shows about chat capture.
///   off      capture disabled in settings
///   no_game  capture on, SWTOR window not found
///   pending  capture requested, waiting for the DLL's hook report
///   active   chat hook installed (all hooks ok)
///   partial  chat hook installed, some optional hooks failed
///   failed   chat hook could not be installed
export type CaptureStatus = "off" | "no_game" | "pending" | "active" | "partial" | "failed";
export interface CaptureStatusDetail {
    status: CaptureStatus;
    detail?: string;
}

interface AppStore {
    settings: ISettings;
    chatLogActive: boolean;
    hookedIn: boolean;
    captureStatus: CaptureStatusDetail;
    setCaptureStatus: (s: CaptureStatus, detail?: string) => void;
    activeCharacter: LocalCharacterInfo | undefined;
    shownCharactersError: boolean;
    /// Bumped when names from the installed game are loaded, so "<Loading>" links retry.
    gameDataVersion: number;
    bumpGameDataVersion: () => void;
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
        captureStatus: { status: "off" },
        setCaptureStatus: (status, detail) => set({ captureStatus: { status, detail } }),
        activeCharacter: undefined,
        shownCharactersError: false,
        gameDataVersion: 0,
        bumpGameDataVersion: () => set((state) => ({ gameDataVersion: state.gameDataVersion + 1 })),
        setSettings: (settings) => set({ settings }),
        updateSettings: (updater) => set((state) => ({ settings: produce(state.settings, updater) })),
        setChatLogActive: (chatLogActive) => set({ chatLogActive }),
        setHookedIn: (hookedIn) => set({ hookedIn }),
        setActiveCharacter: (activeCharacter) => set({ activeCharacter }),
        setShownCharactersError: (shownCharactersError) => set({ shownCharactersError }),
    }))
);
