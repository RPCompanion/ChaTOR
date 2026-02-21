import React from "react";
import { save_date_tag, type IDateTag } from "../../lib/network/datetags";
import Checkbox from "../../lib/Checkbox";

interface FavouriteProps {
    date_tag: IDateTag | undefined;
    onChange: (date_tag: IDateTag) => void;
}

export default function Favourite({ date_tag, onChange }: FavouriteProps) {
    if (date_tag == undefined) return null;

    function on_checked(checked: boolean) {
        const updated = { ...date_tag!, favourite: checked };
        save_date_tag(updated);
        onChange(updated);
    }

    return (
        <Checkbox checked={date_tag.favourite} onChange={on_checked}>
            Favourite
        </Checkbox>
    );
}
