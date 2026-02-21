import { create } from 'zustand';
import type { ICustomChannel } from '../lib/network/custom_channels';

interface ChannelStore {
    customChannels: ICustomChannel[];
    setCustomChannels: (channels: ICustomChannel[]) => void;
    addCustomChannel: (channel: ICustomChannel) => void;
    updateCustomChannel: (channel: ICustomChannel) => void;
    removeCustomChannel: (id: number) => void;
}

export const useChannelStore = create<ChannelStore>()((set) => ({
    customChannels: [],
    setCustomChannels: (customChannels) => set({ customChannels }),
    addCustomChannel: (channel) => set((state) => ({ customChannels: [...state.customChannels, channel] })),
    updateCustomChannel: (channel) => set((state) => ({
        customChannels: state.customChannels.map((c) =>
            c.custom_channel_id === channel.custom_channel_id ? channel : c
        )
    })),
    removeCustomChannel: (id) => set((state) => ({
        customChannels: state.customChannels.filter((c) => c.custom_channel_id !== id)
    })),
}));
