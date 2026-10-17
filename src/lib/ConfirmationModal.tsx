import React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ConfirmationModalProps {
    show_modal: boolean;
    onYes: () => void;
    onNo: () => void;
    children?: React.ReactNode;
}

export default function ConfirmationModal({ show_modal, onYes, onNo, children }: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {show_modal && (
                <div className="z-20 fixed inset-0 grid place-items-center bg-space-950/60 backdrop-blur-[2px]">
                    <motion.div
                        className="panel panel-glass w-80 p-5 flex flex-col gap-5"
                        initial={{ y: -24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -24, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <div className="eyebrow text-center">Confirm</div>
                        <div className="text-ink-100 text-center">{children}</div>
                        <div className="flex flex-row gap-2">
                            <button type="button" className="btn btn-primary w-1/2" onClick={onYes}>Yes</button>
                            <button type="button" className="btn w-1/2" onClick={onNo}>No</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
