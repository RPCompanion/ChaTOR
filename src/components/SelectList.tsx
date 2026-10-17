import React from "react";
import type { IListElem } from "./select_list";

interface SelectListProps {
    elems: IListElem<string>[];
    search?: string;
    onInput: (elems: IListElem<string>[]) => void;
}

export default function SelectList({ elems, search, onInput }: SelectListProps) {
    function on_input(elem: IListElem<string>) {
        const updated = elems.map((e) =>
            e.value === elem.value ? { ...e, selected: !e.selected } : e
        );
        onInput(updated);
    }

    const filtered = search == undefined
        ? elems
        : elems.filter((m) => m.value.toLowerCase().includes(search));

    return (
        <>
            {filtered.map((elem) => (
                <div key={elem.value} className="flex flex-row gap-1">
                    <input
                        type="checkbox"
                        checked={elem.selected}
                        onChange={() => on_input(elem)}
                        className="text-lg"
                    />
                    <label className="text-ink-100 text-lg">{elem.value}</label>
                </div>
            ))}
        </>
    );
}
