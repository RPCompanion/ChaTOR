import React from "react";

interface VariableSizeButtonProps {
    onClick: () => void;
    my_classes?: string;
    children?: React.ReactNode;
}

export default function VariableSizeButton({
    onClick,
    my_classes = "bg-slate-700 text-white text-2xl px-2 rounded-md hover:text-gray-500 select-none",
    children,
}: VariableSizeButtonProps) {
    return (
        <button type="button" className={my_classes} onClick={onClick}>
            {children}
        </button>
    );
}
