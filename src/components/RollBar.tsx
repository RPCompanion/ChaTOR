import React, { useState } from "react";
import { DiceFive } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import { submit_post } from "../lib/network";

/// Common dice. SWTOR's `/roll N` rolls 1..N (plain `/roll` is 1..100);
/// anything else the user can type as a command themselves.
const DICE = [2, 6, 12, 20, 100];
const COOLDOWN_MS = 1500;

export default function RollBar() {
    const [busy, setBusy] = useState(false);

    async function roll(sides: number) {
        if (busy) return;
        setBusy(true);
        const response = await submit_post("ChatMessage", [`/roll ${sides}`]);
        if (response.is_err()) {
            toast.error(response.unwrap_err());
        }
        setTimeout(() => setBusy(false), COOLDOWN_MS);
    }

    return (
        <div className="flex flex-row items-center gap-1 select-none">
            <span className="eyebrow inline-flex items-center gap-1 mr-1" title="Rolls /roll <sides> in game">
                <DiceFive size={16} weight="duotone" />
                Roll
            </span>
            {DICE.map((sides) => (
                <button
                    key={sides}
                    type="button"
                    className="btn btn-sm min-w-11"
                    disabled={busy}
                    onClick={() => roll(sides)}
                    title={`/roll ${sides}`}
                >
                    d{sides}
                </button>
            ))}
        </div>
    );
}
