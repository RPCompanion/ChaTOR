import React from "react";

interface XButtonProps {
    onClick: () => void;
}

export default function XButton({ onClick }: XButtonProps) {
    return (
        <button
            className="bg-slate-700 px-2 text-white text-xl hover:text-gray-500"
            style={{ borderRadius: "50%" }}
            onClick={onClick}
        >
            X
        </button>
    );
}
