import { create } from 'zustand';
import type { ICustomEmote } from '../lib/network/custom_emote';

interface EmoteStore {
    customEmotes: ICustomEmote[];
    setCustomEmotes: (emotes: ICustomEmote[]) => void;
    addCustomEmote: (emote: ICustomEmote) => void;
    updateCustomEmote: (emote: ICustomEmote) => void;
    deleteCustomEmote: (id: number) => void;
}

export const useEmoteStore = create<EmoteStore>()((set) => ({
    customEmotes: [],
    setCustomEmotes: (customEmotes) => set({ customEmotes }),
    addCustomEmote: (emote) => set((state) => ({ customEmotes: [...state.customEmotes, emote] })),
    updateCustomEmote: (emote) => set((state) => ({
        customEmotes: state.customEmotes.map((e) => e.custom_emote_id === emote.custom_emote_id ? emote : e)
    })),
    deleteCustomEmote: (id) => set((state) => ({
        customEmotes: state.customEmotes.filter((e) => e.custom_emote_id !== id)
    })),
}));
