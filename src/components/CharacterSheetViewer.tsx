import React from "react";
import { useAccountStore } from "../store/useAccountStore";
import type { ICharacterSheet } from "../lib/character_sheet/character_sheet";
import { CaretDown } from "@phosphor-icons/react";

interface CharacterSheetViewerProps {
    sheet: ICharacterSheet;
    server_id: number;
}

export default function CharacterSheetViewer({ sheet, server_id }: CharacterSheetViewerProps) {
    const servers = useAccountStore((s) => s.servers);
    const server_name = servers.find((s) => s.server_id === server_id)!.name;

    return (
        <div className="flex flex-col items-center">
            <p className="text-white text-2xl"><b>{sheet.name}</b></p>
            <p className="text-white text-xl underline">{server_name}</p>
            {sheet.description != null && (
                <p className="text-white text-xl">{sheet.description}</p>
            )}
            {sheet.perks != undefined && (
                <>
                    <div className="h-6"></div>
                    <p className="text-white text-2xl underline">Perks</p>
                    {sheet.perks.length > 0 && <div className="h-6"></div>}
                    <div className="flex flex-row gap-2">
                        {sheet.perks.map((perk, i) => (
                            <p key={i} className="text-white bg-slate-500 rounded-md px-2">{perk}</p>
                        ))}
                    </div>
                </>
            )}
            {sheet.weapon_proficiencies.length > 0 && (
                <>
                    <div className="h-6"></div>
                    <p className="text-white text-2xl underline">Weapon Proficiencies</p>
                    <div className="h-6"></div>
                    <div className="flex flex-row gap-2">
                        {sheet.weapon_proficiencies.map((wp, i) => (
                            <p key={i} className="text-white bg-slate-500 rounded-md px-2">{wp}</p>
                        ))}
                    </div>
                </>
            )}
            <div className="h-6"></div>
            <div className="flex flex-col gap-1 select-none">
                {sheet.attributes.map((attribute, i) => (
                    <details key={i}>
                        <summary className={`grid grid-cols-2 text-white text-2xl bg-slate-700 rounded-md p-1 ${attribute.skills != undefined ? "cursor-pointer" : ""}`}>
                            <p className="flex flex-row">
                                {attribute.name}
                                {attribute.skills != undefined && <CaretDown className="text-white" size={22} />}
                            </p>
                            <div className="flex flex-row-reverse pr-2">
                                <p>{attribute.value}</p>
                            </div>
                        </summary>
                        {attribute.skills != undefined && (
                            <div className="pl-4 flex flex-col gap-1">
                                <div></div>
                                {attribute.skills.map((skill, j) => (
                                    <div key={j} className="grid grid-cols-2 text-white text-xl bg-slate-600 rounded-md pb-1">
                                        <p>{skill.name}:</p>
                                        <p className="flex flex-row-reverse pr-2">{skill.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </details>
                ))}
            </div>
        </div>
    );
}
