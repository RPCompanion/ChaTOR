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
                            <div className="title-bar">Favourite Emotes</div>
                            <div className="h-2"></div>
                        </>
                    )}
                    <EmoteContainer emotes={custom_emotes} favourite={true} />
                    {non_fav_emotes.length > 0 && fav_emotes.length > 0 && (
                        <>
                            <div className="h-1"></div>
                            <div className="title-bar">Emotes</div>
                            <div className="h-2"></div>
                        </>
                    )}
                    <EmoteContainer emotes={custom_emotes} favourite={false} />
                </div>
                <div className="h-6"></div>
                <div className="flex flex-row justify-center">
                    <button
                        className="btn btn-primary w-40"
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
