import React from "react";
import { Link } from "react-router-dom";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useEmoteStore } from "../../store/useEmoteStore";
import CustomEmoteElem from "./CustomEmoteElem";
import { get_relevant_emotes_from_list, reorder_emotes_and_update, type IDNDCustomEmote } from "../../lib/custom_emote_utils";

export default function CustomEmotesList() {
    const custom_emotes = useEmoteStore((s) => s.customEmotes);
    const sensors = useSensors(useSensor(PointerSensor));

    let items: IDNDCustomEmote[] = get_relevant_emotes_from_list(custom_emotes, true);

    if (items.length === 0) {
        return (
            <>
                <div className="title-bar select-none">Favourite Emotes</div>
                <p className="text-sm text-ink-300 text-center">
                    No favourite emotes yet. Star emotes on{" "}
                    <Link to="/custom_emotes" className="text-holo-300 hover:underline">Add/Edit Emotes</Link>
                    {" "}to post them from here with one click.
                </p>
            </>
        );
    }

    function on_drag_end(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const old_index = items.findIndex((e) => e.id === active.id);
        const new_index = items.findIndex((e) => e.id === over.id);
        const reordered = arrayMove(items, old_index, new_index);
        reorder_emotes_and_update(reordered);
    }

    return (
        <>
            <div className="title-bar select-none">
                Favourite Emotes
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={on_drag_end}>
                <SortableContext items={items.map((e) => e.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex flex-row flex-wrap gap-2 max-h-56 overflow-y-auto">
                        {items.map((emote) => (
                            <CustomEmoteElem key={emote.id} emote={emote} favourite={true} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </>
    );
}
