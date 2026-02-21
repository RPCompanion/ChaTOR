import React, { useState } from "react";
import { useEmoteStore } from "../../store/useEmoteStore";
import EmoteContainer from "./EmoteContainer";
import EmoteModal from "./EmoteModal";

export default function CustomEmotesPage() {
    const custom_emotes = useEmoteStore((s) => s.customEmotes);
    const [show_modal, setShowModal] = useState(false);

    const fav_emotes = custom_emotes.filter((e) => e.favourite);
    const non_fav_emotes = custom_emotes.filter((e) => !e.favourite);

    return (
        <>
            <div className="h-12"></div>
            <div className="w-full relative">
                <div>
                    <div className="h-2"></div>
                    {fav_emotes.length > 0 && (
                        <>
                            <p className="text-white text-2xl text-center">Favourite Emotes</p>
                            <div className="h-2"></div>
                        </>
                    )}
                    <EmoteContainer emotes={custom_emotes} favourite={true} />
                    {non_fav_emotes.length > 0 && fav_emotes.length > 0 && (
                        <>
                            <div className="h-1"></div>
                            <p className="text-white text-2xl text-center">Emotes</p>
                            <div className="h-2"></div>
                        </>
                    )}
                    <EmoteContainer emotes={custom_emotes} favourite={false} />
                </div>
                <div className="h-6"></div>
                <div className="flex flex-row justify-center">
                    <button
                        className="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500"
                        onClick={() => setShowModal(true)}
                    >
                        New Emote
                    </button>
                </div>
                <EmoteModal
                    show_modal={show_modal}
                    onSave={() => setShowModal(false)}
                    onCancel={() => setShowModal(false)}
                />
            </div>
        </>
    );
}
