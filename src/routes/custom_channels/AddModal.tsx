import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChannelStore } from "../../store/useChannelStore";
import { custom_channel_save } from "../../lib/network/custom_channels";
import { toast_error } from "../../lib/utils";
import { channel_name_valid, MAX_CHANNEL_NAME_LENGTH } from "./custom_channels";
import VariableSizeButton from "../../lib/buttons/VariableSizeButton";

interface AddModalProps {
    onCancel: () => void;
}

export default function AddModal({ onCancel }: AddModalProps) {
    const custom_channels = useChannelStore((s) => s.customChannels);
    const available_numbers = [4, 5, 6, 7, 8, 9, 0].filter(
        (n) => !custom_channels.find((c) => c.channel_number === n)
    );
    const [channel_name, setChannelName] = useState("");
    const [channel_number, setChannelNumber] = useState(available_numbers[0]);

    async function on_save() {
        const result = channel_name_valid(channel_name);
        if (result.is_err()) {
            toast_error(result.unwrap_err());
            return;
        }
        const response = await custom_channel_save({ channel_name, channel_number });
        if (response.is_err()) {
            toast_error(response.unwrap_err());
            return;
        }
        onCancel();
    }

    function on_channel_input(e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value;
        if (val.length > MAX_CHANNEL_NAME_LENGTH) val = val.slice(0, MAX_CHANNEL_NAME_LENGTH);
        setChannelName(val);
    }

    return (
        <motion.div
            className="absolute bg-slate-600 rounded-md w-1/2 p-2"
            style={{ left: "50%", transform: "translate(-50%, -50%)" }}
            initial={{ y: -1000 }}
            animate={{ y: 0 }}
            exit={{ y: -1000 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full flex flex-col gap-2 items-center">
                <input
                    type="text"
                    className="rounded-md outline-none border-2 border-slate-700 px-2"
                    placeholder="channel name"
                    value={channel_name}
                    onChange={on_channel_input}
                />
                <label htmlFor="channel-select" className="text-white text-xl">Channel</label>
                <select
                    id="channel-select"
                    className="rounded-md w-1/3 outline-slate-700 border-2 border-slate-700"
                    value={channel_number}
                    onChange={(e) => setChannelNumber(Number(e.target.value))}
                >
                    {available_numbers.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>
            <div className="h-2"></div>
            <div className="flex flex-row gap-1 w-full justify-center">
                <VariableSizeButton onClick={on_save}>Save</VariableSizeButton>
                <VariableSizeButton onClick={onCancel}>Cancel</VariableSizeButton>
            </div>
        </motion.div>
    );
}
