import React from "react";

interface StandardMenuButtonProps {
    text: string;
    onClick: () => void;
}

export default function StandardMenuButton({ text, onClick }: StandardMenuButtonProps) {
    return (
        <button
            type="button"
            className="btn btn-primary btn-block py-1.5"
            onClick={onClick}
        >
            {text}
        </button>
    );
}
