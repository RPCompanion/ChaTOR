import React from "react";
import type { GameItemTooltip, GameQuestTooltip, GameStat, GameTooltip } from "../../lib/game_data";

// Line order and wording follow the Jedipedia tooltips this replaces (see swtor-gamedata's
// tooltip.rs); colours come from the .game-tooltip classes in app.css.

function StatLines({ stats }: { stats: GameStat[] }) {
    return (
        <>
            {stats.map((s, i) => (
                <div key={i} className="tt-blue tt-indent2">+{s.value} {s.name}</div>
            ))}
        </>
    );
}

function ItemBody({ item }: { item: GameItemTooltip }) {
    const requirements = [
        item.required_level != null ? `Requires Level ${item.required_level}` : null,
        item.armor_type ? `Requires ${item.armor_type}` : null,
    ].filter((r): r is string => r != null);

    return (
        <>
            <p className={`tt-title q-${item.quality}`}>{item.name}</p>
            <div className="tt-main">
                {item.cartel_market && <div className="tt-amber">Cartel Market Item</div>}
                {item.count != null && <div className="tt-blue">Count: {item.count}</div>}
                {item.roll_level != null && <div className="tt-blue">Item Roll Level {item.roll_level}</div>}
                {item.binding && <div className="tt-blue">{item.binding}</div>}
                {item.unique && <div className="tt-blue">Unique</div>}
                {item.armor_type && <div className="tt-blue">{item.armor_type}</div>}
                {item.durability != null && <div className="tt-blue">Durability: {item.durability}/{item.durability}</div>}
            </div>
            {item.stats.length > 0 && (
                <div className="tt-main">
                    <div className="tt-white">Total Stats:</div>
                    <StatLines stats={item.stats} />
                </div>
            )}
            {item.modifications.length > 0 && (
                <div className="tt-main">
                    <div className="tt-blue">Item Modifications</div>
                    {item.modifications.map((m, i) =>
                        m.module ? (
                            <React.Fragment key={i}>
                                <div className="tt-white tt-indent">
                                    {m.slot}{m.module.level != null && ` (${m.module.level})`}:{" "}
                                    <span className={`q-${m.module.quality}`}>{m.module.name}</span>
                                </div>
                                <StatLines stats={m.module.stats} />
                            </React.Fragment>
                        ) : (
                            <div key={i} className="tt-white tt-indent">{m.slot}: empty</div>
                        )
                    )}
                </div>
            )}
            {requirements.length > 0 && (
                <div className="tt-main tt-blue">
                    {requirements.map((r) => <div key={r}>{r}</div>)}
                </div>
            )}
            {item.abilities.map((a, i) => (
                <div key={i} className="tt-main tt-green">{a.trigger === "use" ? "Use" : "Equip"}: {a.text}</div>
            ))}
            {item.description && <div className="tt-main tt-amber whitespace-pre-line">{item.description}</div>}
        </>
    );
}

function QuestBody({ quest }: { quest: GameQuestTooltip }) {
    const details = [
        quest.category,
        quest.required_level != null ? `Level ${quest.required_level}` : null,
        quest.repeatable ? "Repeatable" : null,
    ].filter((d): d is string => d != null);

    return (
        <>
            <p className="tt-title">{quest.name}</p>
            {details.length > 0 && <div className="tt-main tt-blue">{details.join(" · ")}</div>}
            {quest.description.map((text, i) => (
                <p key={i} className="tt-main whitespace-pre-line">{text}</p>
            ))}
            {quest.objectives.length > 0 && (
                <div className="tt-main">
                    <div className="tt-white">Objectives</div>
                    {quest.objectives.map((o, i) => <div key={i} className="tt-blue tt-indent">{o}</div>)}
                </div>
            )}
        </>
    );
}

export default function GameTooltipView({ tooltip }: { tooltip: GameTooltip }) {
    if (tooltip.kind === "quest") {
        return <section className="con-inv"><QuestBody quest={tooltip} /></section>;
    }
    const frame = tooltip.kind === "item" ? `q-${tooltip.quality}` : undefined;
    return (
        <section className="con-inv">
            <div className="game-tooltip-icon">
                {tooltip.icon_url
                    ? <img src={tooltip.icon_url} width={52} height={52} alt="" className={frame} />
                    : <div className="game-tooltip-icon-missing" />}
                {tooltip.kind === "achievement" && tooltip.prestige != null && <div>x {tooltip.prestige}</div>}
            </div>
            <div className="tooltip tooltip-itm">
                {tooltip.kind === "item" ? (
                    <ItemBody item={tooltip} />
                ) : (
                    <>
                        <p className="tt-title">{tooltip.name}</p>
                        {tooltip.description && <div className="tt-main tt-blue">{tooltip.description}</div>}
                    </>
                )}
            </div>
        </section>
    );
}
