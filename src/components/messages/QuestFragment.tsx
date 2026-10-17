import React, { useState, useEffect } from "react";
import type { HyperLinkQuest } from "../../lib/hyperlink/quest";
import { get_name_by_global_id } from "../../lib/game_data";

interface QuestFragmentProps {
    fragment: HyperLinkQuest;
}

export default function QuestFragment({ fragment }: QuestFragmentProps) {
    const [name, setName] = useState<string | undefined>(undefined);

    useEffect(() => {
        get_name_by_global_id(fragment.id).then((result) => {
            if (result.is_ok()) {
                setName(result.unwrap());
            }
        });
    }, [fragment.id]);

    if (name != undefined) {
        return <span className="wrap-break-word text-ember-400">{"<" + name + ">"}</span>;
    }
    return <span className="wrap-break-word text-ember-400 select-none">{"<Loading>"}</span>;
}
