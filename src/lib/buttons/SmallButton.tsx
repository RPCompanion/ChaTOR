import React from "react";

interface SmallButtonProps {
    onClick: () => void;
    children?: React.ReactNode;
}

export default function SmallButton({ onClick, children }: SmallButtonProps) {
    return (
        <button
            type="button"
            className="btn btn-sm w-32"
            onClick={onClick}
        >
            {children}
        </button>
    );
}
