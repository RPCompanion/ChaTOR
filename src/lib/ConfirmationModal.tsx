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
                <div className="z-20 w-full h-full absolute left-0 top-0">
                    <motion.div
                        className="h-36 w-40 bg-slate-800 rounded-md"
                        style={{ position: "absolute", left: "calc(50% - 4.5rem)", top: "calc(50% - 5rem)" }}
                        initial={{ y: -500 }}
                        animate={{ y: 0 }}
                        exit={{ y: -500 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-white text-xl text-center">
                            {children}
                        </div>
                        <div className="mt-6"></div>
                        <div className="flex flex-row gap-2 px-1">
                            <button className="bg-slate-700 p-1 text-white rounded-md w-1/2" onClick={onYes}>Yes</button>
                            <button className="bg-slate-700 p-1 text-white rounded-md w-1/2" onClick={onNo}>No</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
