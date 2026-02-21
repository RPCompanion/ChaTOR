import React from "react";

interface SmallButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
}

export default function SmallButton({ onClick, children }: SmallButtonProps) {
    return (
        <button
            type="button"
            className="bg-slate-700 text-white text-xl px-2 rounded-md w-32 hover:text-gray-500"
            onClick={onClick}
        >
            {children}
        </button>
    );
}
