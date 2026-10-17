import React from "react";
import { toast } from "react-toastify";
import { useEmoteStore } from "../../store/useEmoteStore";
import { submit_post } from "../../lib/network";
import PageFormatting from "../../components/PageFormatting";
import VariableSizeButton from "../../lib/buttons/VariableSizeButton";
import type { ICustomEmote } from "../../lib/network/custom_emote";

export default function EmoteBoardPage() {
    const custom_emotes = useEmoteStore((s) => s.customEmotes);

    async function on_emote_click(emote: ICustomEmote) {
        const response = await submit_post("ButtonEmote", [emote.emote]);
        if (response.is_err()) {
            toast.error(response.unwrap_err());
        }
    }

    return (
        <PageFormatting title="Emote Board">
            <div className="flex flex-row flex-wrap gap-1 w-full justify-center">
                {custom_emotes.map((emote) => (
                    <div key={emote.custom_emote_id}>
                        <VariableSizeButton
                            onClick={() => on_emote_click(emote)}
                            my_classes={
                                emote.favourite
                                    ? "bg-ember-500 text-black text-lg px-2 rounded-sm hover:text-ink-100"
                                    : undefined
                            }
                        >
                            {emote.emote_name}
                        </VariableSizeButton>
                    </div>
                ))}
            </div>
        </PageFormatting>
    );
}
