import React from "react";

interface VariableSizeButtonProps {
    onClick: () => void;
    my_classes?: string;
    children?: React.ReactNode;
}

export default function VariableSizeButton({
    onClick,
    my_classes = "btn",
    children,
}: VariableSizeButtonProps) {
    return (
        <button type="button" className={my_classes} onClick={onClick}>
            {children}
        </button>
    );
}
