import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SwtorChatTabMessages } from '../lib/network/swtor_message/swtor_chat_tab_messages';
import type { IListElem } from '../components/select_list';

interface ChatLogStore {
    swtorChannelMessages: SwtorChatTabMessages[];
    activeChatTabIndex: number;
    showRestorePostsButton: boolean;
    playersFilter: IListElem<string>[];
    setSwtorChannelMessages: (messages: SwtorChatTabMessages[]) => void;
    setActiveChatTabIndex: (index: number) => void;
    setShowRestorePostsButton: (v: boolean) => void;
    setPlayersFilter: (players: IListElem<string>[]) => void;
    updatePlayersFilter: (updater: (players: IListElem<string>[]) => IListElem<string>[]) => void;
}

export const useChatLogStore = create<ChatLogStore>()(
    subscribeWithSelector((set) => ({
        swtorChannelMessages: [],
        activeChatTabIndex: 0,
        showRestorePostsButton: true,
        playersFilter: [],
        setSwtorChannelMessages: (swtorChannelMessages) => set({ swtorChannelMessages }),
        setActiveChatTabIndex: (activeChatTabIndex) => set({ activeChatTabIndex }),
        setShowRestorePostsButton: (showRestorePostsButton) => set({ showRestorePostsButton }),
        setPlayersFilter: (playersFilter) => set({ playersFilter }),
        updatePlayersFilter: (updater) => set((state) => ({ playersFilter: updater(state.playersFilter) })),
    }))
);
