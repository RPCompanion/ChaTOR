import React from "react";

interface StandardMenuButtonProps {
    text: string;
    onClick: () => void;
}

export default function StandardMenuButton({ text, onClick }: StandardMenuButtonProps) {
    return (
        <button
            type="button"
            className="bg-slate-700 text-white rounded-sm shadow-sm hover:text-gray-300 text-xl"
            onClick={onClick}
        >
            {text}
        </button>
    );
}
