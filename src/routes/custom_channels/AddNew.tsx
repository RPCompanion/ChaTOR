import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useChannelStore } from "../../store/useChannelStore";
import VariableSizeButton from "../../lib/buttons/VariableSizeButton";
import AddModal from "./AddModal";

export default function AddNew() {
    const custom_channels = useChannelStore((s) => s.customChannels);
    const [show_modal, setShowModal] = useState(false);

    if (custom_channels.length >= 7) return null;

    return (
        <>
            <div className="h-4"></div>
            <div className="w-full flex flex-row justify-center">
                <VariableSizeButton onClick={() => setShowModal(true)}>Add New</VariableSizeButton>
            </div>
            <AnimatePresence>
                {show_modal && <AddModal onCancel={() => setShowModal(false)} />}
            </AnimatePresence>
        </>
    );
}
