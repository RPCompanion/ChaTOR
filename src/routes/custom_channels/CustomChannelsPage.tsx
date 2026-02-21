import React from "react";
import HelpfulText from "./HelpfulText";
import AddNew from "./AddNew";
import Existing from "./Existing";

export default function CustomChannelsPage() {
    return (
        <>
            <HelpfulText />
            <Existing />
            <AddNew />
        </>
    );
}
