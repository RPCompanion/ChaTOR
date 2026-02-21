import React, { useState, useEffect } from "react";

interface LinkComponentProps {
    href?: string;
    title?: string;
    children?: React.ReactNode;
}

export default function LinkComponent({ href = "", title, children }: LinkComponentProps) {
    const [image_link, setImageLink] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = href;
        img.onload = () => setImageLink(true);
    }, [href]);

    if (image_link) {
        return <img src={href} title={title} alt={String(children)} />;
    }
    return <div>{href}</div>;
}
