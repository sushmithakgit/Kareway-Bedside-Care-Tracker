import { useState } from "react";
import KwIcon from "./icons/KwIcon";
import TrackerDetailPopup from "./TrackerDetailPopup";

/* Returns "met" | "unmet" | "neutral" for a whole tracker category */
function getCategoryStatus(fieldData, fieldGoals) {
    if (!fieldGoals) return "neutral";
    const entries = Object.entries(fieldGoals);
    if (!entries.some(([, v]) => v > 0)) return "neutral";
    return entries.every(([k, goal]) => !goal || (fieldData?.[k] || 0) >= goal) ? "met" : "unmet";
}

export default function TrackerSummaryPanel({ trackerData = {}, goals = {}, language, onNavigate }) {
    const [openTracker, setOpenTracker] = useState(null);

    const water    = trackerData.water    || { glasses: 0 };
    const food     = trackerData.food     || { meals: 0, protein: 0, carbs: 0, vitamins: 0 };
    const restroom = trackerData.restroom || { visits: 0, urineML: 0 };
    const sleep    = trackerData.sleep    || { hours: 0 };

    const ta = language === "ta";

    const sleepDisplay = (() => {
        const h = sleep.hours;
        if (h === 0) return "0";
        const whole = Math.floor(h);
        const mins = Math.round((h - whole) * 60);
        if (mins === 0) return `${whole}`;
        if (whole === 0) return `${mins}m`;
        return `${whole}h ${mins}m`;
    })();

    const items = [
        {
            key: "water",
            icon: "dropOutline",
            label: ta ? "தண்ணீர்" : "Water",
            value: water.glasses,
            unit: ta ? "கிளாஸ்" : "gl",
            sub: `${(water.glasses * 0.25).toFixed(2)} L`,
            color: "var(--kw-comfort)",
            tint: "var(--kw-comfort-tint)",
            fieldData: water,
        },
        {
            key: "food",
            icon: "food",
            label: ta ? "உணவு" : "Food",
            value: food.meals,
            unit: ta ? "வேளை" : "meals",
            sub: food.protein > 0 || food.carbs > 0 ? `P${food.protein}g · C${food.carbs}g` : "—",
            color: "var(--kw-social)",
            tint: "var(--kw-social-tint)",
            fieldData: food,
        },
        {
            key: "restroom",
            icon: "bathroom",
            label: ta ? "கழிவறை" : "Restroom",
            value: restroom.visits,
            unit: ta ? "முறை" : "visits",
            sub: restroom.urineML > 0 ? `${(restroom.urineML / 1000).toFixed(2)} L` : "—",
            color: "var(--kw-movement)",
            tint: "var(--kw-movement-tint)",
            fieldData: restroom,
        },
        {
            key: "sleep",
            icon: "moon",
            label: ta ? "தூக்கம்" : "Sleep",
            value: sleepDisplay,
            unit: ta ? "மணி" : "hrs",
            sub: "",
            color: "var(--kw-brand)",
            tint: "var(--kw-brand-tint)",
            fieldData: sleep,
        },
    ];

    return (
        <>
            <div
                className="rounded-2xl p-4"
                style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}
            >
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-subtle)" }}>
                            {ta ? "இன்றைய கண்காணிப்பு" : "Today's Trackers"}
                        </div>
                        <div className="text-[13px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "தட்டி விவரங்களை காண்க" : "Tap a tile to see details"}
                        </div>
                    </div>
                    {onNavigate && (
                        <button
                            onClick={onNavigate}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-all hover:opacity-80"
                            style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-bg-deep)" }}
                        >
                            {ta ? "புதுப்பி" : "Update"}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {items.map((item) => {
                        const status = getCategoryStatus(item.fieldData, goals[item.key]);
                        const borderStyle =
                            status === "met"   ? "2px solid var(--kw-brand)" :
                            status === "unmet" ? "2px solid var(--kw-er)" :
                            `1px solid ${item.color}33`;

                        return (
                            <button
                                key={item.key}
                                onClick={() => setOpenTracker(item.key)}
                                className="rounded-xl px-3 py-2.5 text-left transition-all hover:scale-[1.03] active:scale-[0.97]"
                                style={{ background: item.tint, border: borderStyle }}
                                aria-label={`${item.label} details`}
                            >
                                {/* Label row with status dot */}
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <div className="flex items-center gap-1.5" style={{ color: item.color }}>
                                        <KwIcon name={item.icon} size={13} strokeWidth={2.2} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] font-tamil leading-none">
                                            {item.label}
                                        </span>
                                    </div>
                                    {status !== "neutral" && (
                                        <span
                                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                                            style={{
                                                background: status === "met" ? "var(--kw-brand)" : "var(--kw-er)",
                                                color: "white",
                                            }}
                                        >
                                            <KwIcon name={status === "met" ? "check" : "alert"} size={9} strokeWidth={3} />
                                        </span>
                                    )}
                                </div>

                                {/* Value */}
                                <div
                                    className="font-display font-semibold tabular-nums leading-none"
                                    style={{ fontSize: "1.45rem", color: "var(--kw-ink)", letterSpacing: "-0.02em" }}
                                >
                                    {item.value}
                                    <span className="text-[11px] font-normal ml-1" style={{ color: "var(--kw-muted)" }}>
                                        {item.unit}
                                    </span>
                                </div>
                                {item.sub && (
                                    <div className="text-[10px] mt-1" style={{ color: "var(--kw-muted)" }}>
                                        {item.sub}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Detail popup */}
            <TrackerDetailPopup
                open={openTracker !== null}
                tracker={openTracker}
                trackerData={trackerData}
                goals={goals}
                language={language}
                onClose={() => setOpenTracker(null)}
            />
        </>
    );
}
