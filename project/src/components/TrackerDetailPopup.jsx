import { useEffect } from "react";
import KwIcon from "./icons/KwIcon";

/* ─── Progress bar ─── */
function ProgressBar({ value, goal }) {
    if (!goal) return null;
    const pct = Math.min(100, (value / goal) * 100);
    const met = value >= goal;
    return (
        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "var(--kw-line)" }}>
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: met ? "var(--kw-brand)" : "var(--kw-er)" }}
            />
        </div>
    );
}

/* ─── Tracker visual config ─── */
const TRACKER_META = {
    water:    { icon: "dropOutline", color: "var(--kw-comfort)",  tint: "var(--kw-comfort-tint)",  getTitle: (ta) => ta ? "தண்ணீர் கண்காணிப்பு"  : "Water Intake"      },
    food:     { icon: "food",        color: "var(--kw-social)",   tint: "var(--kw-social-tint)",   getTitle: (ta) => ta ? "உணவு கண்காணிப்பு"     : "Food & Nutrition"  },
    restroom: { icon: "bathroom",    color: "var(--kw-movement)", tint: "var(--kw-movement-tint)", getTitle: (ta) => ta ? "கழிவறை கண்காணிப்பு"  : "Restroom Tracker"  },
    sleep:    { icon: "moon",        color: "var(--kw-brand)",    tint: "var(--kw-brand-tint)",    getTitle: (ta) => ta ? "தூக்க கண்காணிப்பு"    : "Sleep Tracker"     },
};

/* ─── Helpers ─── */
function fmtH(h) {
    if (h === 0) return "0";
    const w = Math.floor(h), m = Math.round((h - w) * 60);
    if (m === 0) return `${w}`;
    if (w === 0) return `${m}m`;
    return `${w}h ${m}m`;
}

/* Build the metric rows for each tracker category */
function buildMetrics(tracker, data, goals, ta) {
    switch (tracker) {
        case "water": {
            const v = data.water?.glasses || 0, g = goals.water?.glasses || 0;
            const rem = Math.max(0, g - v);
            return g > 0 ? [{
                key: "glasses",
                label: ta ? "தண்ணீர் (கிளாஸ்)" : "Water (glasses)",
                consumed: v, goal: g,
                displayConsumed: `${v}`, displayGoal: `${g}`, displayUnit: ta ? "கிளாஸ்" : "glasses",
                sub: `${(v * 0.25).toFixed(2)} L consumed · ${(g * 0.25).toFixed(2)} L target`,
                suggestion: rem > 0 ? (ta
                    ? `${rem} கிளாஸ் (${(rem * 0.25).toFixed(2)} L) மேலும் தேவை.`
                    : `Offer ${rem} more glass${rem > 1 ? "es" : ""} (${(rem * 0.25).toFixed(2)} L) to reach today's target.`)
                    : null,
            }] : [];
        }
        case "food": {
            const d = { meals: 0, protein: 0, carbs: 0, vitamins: 0, ...data.food };
            const gf = { meals: 0, protein: 0, carbs: 0, vitamins: 0, ...goals.food };
            return [
                { key: "meals",    label: ta ? "உணவு வேளை"         : "Meals",                 consumed: d.meals,    goal: gf.meals,    displayConsumed: `${d.meals}`,    displayGoal: `${gf.meals}`,    displayUnit: ta ? "வேளை"    : "meals",       suggestion: Math.max(0, gf.meals    - d.meals)    > 0 ? (ta ? `${gf.meals - d.meals} வேளை மேலும் தேவை.` : `${gf.meals - d.meals} more meal${gf.meals - d.meals > 1 ? "s" : ""} needed today.`) : null },
                { key: "protein",  label: ta ? "புரதம்"             : "Protein",               consumed: d.protein,  goal: gf.protein,  displayConsumed: `${d.protein}`,  displayGoal: `${gf.protein}`,  displayUnit: "g",                           suggestion: Math.max(0, gf.protein  - d.protein)  > 0 ? (ta ? `${gf.protein - d.protein}g புரதம் மேலும் தேவை.` : `${gf.protein - d.protein}g more protein needed — consider a protein-rich snack.`) : null },
                { key: "carbs",    label: ta ? "கார்போஹைட்ரேட்"   : "Carbohydrates",         consumed: d.carbs,    goal: gf.carbs,    displayConsumed: `${d.carbs}`,    displayGoal: `${gf.carbs}`,    displayUnit: "g",                           suggestion: Math.max(0, gf.carbs    - d.carbs)    > 0 ? (ta ? `${gf.carbs - d.carbs}g கார்போஹைட்ரேட் மேலும் தேவை.` : `${gf.carbs - d.carbs}g more carbohydrates needed today.`) : null },
                { key: "vitamins", label: ta ? "வைட்டமின் மாத்திரை" : "Vitamin Supplements",  consumed: d.vitamins, goal: gf.vitamins, displayConsumed: `${d.vitamins}`, displayGoal: `${gf.vitamins}`, displayUnit: ta ? "மாத்திரை" : "supplements", suggestion: Math.max(0, gf.vitamins - d.vitamins) > 0 ? (ta ? `${gf.vitamins - d.vitamins} வைட்டமின் மேலும் தேவை.` : `${gf.vitamins - d.vitamins} more supplement${gf.vitamins - d.vitamins > 1 ? "s" : ""} to be administered.`) : null },
            ].filter(m => m.goal > 0);
        }
        case "restroom": {
            const d = { visits: 0, urineML: 0, ...data.restroom };
            const gr = { visits: 0, urineML: 0, ...goals.restroom };
            const vRem = Math.max(0, gr.visits - d.visits);
            const uRem = Math.max(0, gr.urineML - d.urineML);
            return [
                { key: "visits",  label: ta ? "கழிவறை பயன்பாடு" : "Restroom Visits", consumed: d.visits,  goal: gr.visits,  displayConsumed: `${d.visits}`,  displayGoal: `${gr.visits}`,  displayUnit: ta ? "முறை" : "visits", suggestion: vRem > 0 ? (ta ? "எதிர்பார்த்ததை விட குறைவான பயன்பாடு. நோயாளியின் நிலையை கவனி." : "Fewer visits than expected. Monitor patient comfort and hydration.") : null },
                { key: "urineML", label: ta ? "சிறுநீர் வெளியீடு" : "Urine Output",   consumed: d.urineML, goal: gr.urineML, displayConsumed: `${d.urineML}`, displayGoal: `${gr.urineML}`, displayUnit: "ml",
                    sub: `${(d.urineML / 1000).toFixed(2)} L consumed · ${(gr.urineML / 1000).toFixed(2)} L target`,
                    suggestion: uRem > 0 ? (ta ? `சிறுநீர் வெளியீடு ${uRem}ml குறைவாக உள்ளது. திரவ உட்கொள்ளலை அதிகரிக்கவும்.` : `Urine output is ${uRem} ml below target. Encourage increased fluid intake.`) : null },
            ].filter(m => m.goal > 0);
        }
        case "sleep": {
            const v = data.sleep?.hours || 0, g = goals.sleep?.hours || 0;
            const rem = Math.max(0, g - v);
            return g > 0 ? [{
                key: "hours",
                label: ta ? "தூக்க நேரம்" : "Sleep Duration",
                consumed: v, goal: g,
                displayConsumed: fmtH(v), displayGoal: fmtH(g), displayUnit: ta ? "மணி" : "hours",
                suggestion: rem > 0 ? (ta ? `${fmtH(rem)} மேலும் தூக்கம் தேவை.` : `Patient needs ${fmtH(rem)} more sleep to meet the daily requirement.`) : null,
            }] : [];
        }
        default: return [];
    }
}

/* ─── Main popup ─── */
export default function TrackerDetailPopup({ open, tracker, trackerData, goals, language, onClose }) {
    const ta = language === "ta";

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open || !tracker) return null;

    const meta = TRACKER_META[tracker];
    const metrics = buildMetrics(tracker, trackerData || {}, goals || {}, ta);
    const allMet = metrics.length > 0 && metrics.every(m => m.consumed >= m.goal);
    const noGoals = metrics.length === 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.55)", backdropFilter: "blur(10px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-md rounded-3xl overflow-hidden"
                style={{ background: "var(--kw-surface)", boxShadow: "var(--kw-shadow-xl)", border: "1px solid var(--kw-line)" }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-5"
                    style={{ background: meta.tint, borderBottom: "1px solid var(--kw-line)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: `${meta.color}22`, color: meta.color }}
                        >
                            <KwIcon name={meta.icon} size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="font-display font-semibold font-tamil" style={{ color: "var(--kw-ink)", fontSize: "1.05rem" }}>
                                {meta.getTitle(ta)}
                            </h3>
                            <p className="text-[11px] font-tamil" style={{ color: "var(--kw-muted)" }}>
                                {ta ? "தேவை vs உட்கொண்ட அளவு" : "Daily minimum vs consumed"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                        style={{ background: "var(--kw-bg-deep)", color: "var(--kw-muted)", border: "1px solid var(--kw-line)" }}
                        aria-label="Close"
                    >
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Metrics */}
                <div className="p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
                    {noGoals ? (
                        <div className="text-center py-6">
                            <p className="text-sm font-tamil" style={{ color: "var(--kw-muted)" }}>
                                {ta
                                    ? "இந்த கண்காணிப்புக்கு இலக்குகள் அமைக்கப்படவில்லை."
                                    : "No daily targets set yet."}
                            </p>
                            <p className="text-xs mt-1 font-tamil" style={{ color: "var(--kw-subtle)" }}>
                                {ta ? "Trackers தாவலில் Daily Targets பிரிவில் சேர்க்கவும்." : "Add them in the Daily Targets section of the Trackers tab."}
                            </p>
                        </div>
                    ) : (
                        metrics.map((m) => {
                            const met = m.consumed >= m.goal;
                            return (
                                <div
                                    key={m.key}
                                    className="rounded-2xl p-4"
                                    style={{
                                        background: "var(--kw-bg-deep)",
                                        border: `1.5px solid ${met ? "var(--kw-brand)" : "var(--kw-er)"}44`,
                                    }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold font-tamil" style={{ color: "var(--kw-ink-soft)" }}>
                                            {m.label}
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className="font-display font-bold tabular-nums"
                                                style={{ color: met ? "var(--kw-brand)" : "var(--kw-er)", fontSize: "1.15rem", letterSpacing: "-0.015em" }}
                                            >
                                                {m.displayConsumed}
                                            </span>
                                            <span className="text-xs" style={{ color: "var(--kw-muted)" }}>
                                                / {m.displayGoal} {m.displayUnit}
                                            </span>
                                            <span
                                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: met ? "var(--kw-brand-tint)" : "var(--kw-er-tint)", color: met ? "var(--kw-brand)" : "var(--kw-er)" }}
                                            >
                                                <KwIcon name={met ? "check" : "alert"} size={11} strokeWidth={2.5} />
                                            </span>
                                        </div>
                                    </div>
                                    {m.sub && (
                                        <p className="text-[11px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                                            {m.sub}
                                        </p>
                                    )}
                                    <ProgressBar value={m.consumed} goal={m.goal} />
                                    {m.suggestion && (
                                        <div
                                            className="mt-2.5 px-3 py-2 rounded-xl text-xs font-tamil"
                                            style={{ background: "var(--kw-er-tint)", color: "var(--kw-er-deep)" }}
                                        >
                                            💡 {m.suggestion}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {!noGoals && (
                    <div
                        className="px-5 py-3.5 flex items-center gap-2.5"
                        style={{
                            background: allMet ? "var(--kw-brand-tint)" : "var(--kw-er-tint)",
                            borderTop: "1px solid var(--kw-line)",
                        }}
                    >
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: allMet ? "var(--kw-brand)" : "var(--kw-er)", color: "white" }}
                        >
                            <KwIcon name={allMet ? "check" : "alert"} size={11} strokeWidth={2.5} />
                        </span>
                        <p className="text-xs font-semibold font-tamil" style={{ color: allMet ? "var(--kw-brand-ink)" : "var(--kw-er-deep)" }}>
                            {allMet
                                ? (ta ? "இன்றைய அனைத்து இலக்குகளும் நிறைவேறியது! ✓" : "All daily targets met for today! ✓")
                                : (ta ? "சில இலக்குகள் இன்னும் நிறைவேறவில்லை." : "Some targets are still below the daily minimum.")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
