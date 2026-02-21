import React from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { ICustomEmote } from "../../lib/network/custom_emote";
import Emote from "./Emote";
import { get_relevant_emotes_from_list, reorder_emotes_and_update, type IDNDCustomEmote } from "../../lib/custom_emote_utils";

interface EmoteContainerProps {
    emotes: ICustomEmote[];
    favourite: boolean;
}

export default function EmoteContainer({ emotes, favourite }: EmoteContainerProps) {
    const sensors = useSensors(useSensor(PointerSensor));
    let items: IDNDCustomEmote[] = get_relevant_emotes_from_list(emotes, favourite);

    function on_drag_end(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const old_index = items.findIndex((e) => e.custom_emote_id === active.id);
        const new_index = items.findIndex((e) => e.custom_emote_id === over.id);
        const reordered = arrayMove(items, old_index, new_index);
        reorder_emotes_and_update(reordered);
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={on_drag_end}>
            <SortableContext items={items.map((e) => e.custom_emote_id!)} strategy={verticalListSortingStrategy}>
                <section className="flex flex-col gap-2">
                    {items.map((emote) => (
                        <Emote key={emote.custom_emote_id} emote={emote} favourite={favourite} />
                    ))}
                </section>
            </SortableContext>
        </DndContext>
    );
}
