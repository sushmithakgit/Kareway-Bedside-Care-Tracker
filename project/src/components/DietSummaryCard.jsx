import KwIcon from "./icons/KwIcon";

/* ── Macro colour palette (used everywhere in diet feature) ── */
export const MACRO_COLORS = {
    calories: "#f97316",
    protein:  "#3b82f6",
    carbs:    "#f59e0b",
    fat:      "#a855f7",
    fiber:    "#22c55e",
};

/* ── CSS conic-gradient donut chart ── */
function DonutChart({ protein = 0, carbs = 0, fat = 0, calories = 0, target = 2000 }) {
    const pKcal = protein * 4;
    const cKcal = carbs   * 4;
    const fKcal = fat     * 9;
    const total = pKcal + cKcal + fKcal || 1;
    const empty = pKcal + cKcal + fKcal === 0;

    const pDeg = (pKcal / total) * 360;
    const cDeg = (cKcal / total) * 360;

    const gradient = empty
        ? `conic-gradient(var(--kw-line) 0deg 360deg)`
        : `conic-gradient(${MACRO_COLORS.protein} 0deg ${pDeg}deg, ${MACRO_COLORS.carbs} ${pDeg}deg ${pDeg + cDeg}deg, ${MACRO_COLORS.fat} ${pDeg + cDeg}deg 360deg)`;

    const pct = Math.min(100, Math.round((calories / (target || 2000)) * 100));

    return (
        <div className="flex items-center gap-1" style={{ width: 88, height: 88, flexShrink: 0 }}>
            <div
                style={{
                    width: 88, height: 88, borderRadius: "50%",
                    background: gradient,
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: 54, height: 54, borderRadius: "50%",
                        background: "var(--kw-surface)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: 1,
                    }}
                >
                    <span
                        style={{ fontSize: "0.82rem", fontWeight: 700, color: empty ? "var(--kw-subtle)" : MACRO_COLORS.calories, letterSpacing: "-0.02em", lineHeight: 1 }}
                    >
                        {empty ? "—" : calories}
                    </span>
                    <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "var(--kw-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        kcal
                    </span>
                    {!empty && (
                        <span style={{ fontSize: "0.48rem", fontWeight: 600, color: "var(--kw-muted)" }}>{pct}%</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function MacroChip({ label, value, unit, color }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-[11px] font-tamil" style={{ color: "var(--kw-muted)" }}>{label}</span>
            <span className="text-[11px] font-bold tabular-nums ml-auto" style={{ color: "var(--kw-ink)" }}>
                {value}<span className="font-normal text-[10px] ml-0.5" style={{ color: "var(--kw-muted)" }}>{unit}</span>
            </span>
        </div>
    );
}

/* ── Main component ── */
export default function DietSummaryCard({ dietData = {}, dietGoals = {}, language, onNavigate }) {
    const ta = language === "ta";

    /* Today's totals from all meals */
    const totals = ["breakfast", "lunch", "dinner", "snacks"].reduce(
        (acc, meal) => {
            for (const entry of dietData[meal] || []) {
                acc.calories += entry.calories || 0;
                acc.protein  += entry.protein  || 0;
                acc.carbs    += entry.carbs    || 0;
                acc.fat      += entry.fat      || 0;
                acc.fiber    += entry.fiber    || 0;
            }
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const target = dietGoals.calories || 2000;
    const empty  = totals.calories === 0;

    return (
        <div
            className="rounded-2xl p-4"
            style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}
        >
            <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-subtle)" }}>
                        {ta ? "இன்றைய உணவு" : "Today's Nutrition"}
                    </div>
                    <div className="text-[13px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                        {empty
                            ? (ta ? "இன்னும் உணவு பதிவு இல்லை" : "No meals logged yet")
                            : `${target} kcal ${ta ? "இலக்கு" : "target"}`}
                    </div>
                </div>
                {onNavigate && (
                    <button
                        onClick={onNavigate}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-all hover:opacity-80"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-bg-deep)" }}
                    >
                        {ta ? "உணவு பதிவு" : "Log food"}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <DonutChart
                    protein={totals.protein} carbs={totals.carbs} fat={totals.fat}
                    calories={totals.calories} target={target}
                />

                <div className="flex-1 space-y-1.5 min-w-0">
                    <MacroChip label={ta ? "புரதம்"         : "Protein"}      value={Math.round(totals.protein)} unit="g"    color={MACRO_COLORS.protein} />
                    <MacroChip label={ta ? "கார்போஹைட்ரேட்" : "Carbs"}        value={Math.round(totals.carbs)}   unit="g"    color={MACRO_COLORS.carbs} />
                    <MacroChip label={ta ? "கொழுப்பு"       : "Fat"}          value={Math.round(totals.fat)}     unit="g"    color={MACRO_COLORS.fat} />
                    <MacroChip label={ta ? "நார்ச்சத்து"    : "Fiber"}        value={Math.round(totals.fiber)}   unit="g"    color={MACRO_COLORS.fiber} />
                </div>
            </div>

            {/* Calorie progress bar */}
            {!empty && (
                <div className="mt-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--kw-line)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, (totals.calories / target) * 100)}%`,
                                background: totals.calories > target ? "var(--kw-er)" : MACRO_COLORS.calories,
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {totals.calories} kcal {ta ? "உட்கொண்டது" : "consumed"}
                        </span>
                        <span className="text-[10px] font-tamil" style={{ color: totals.calories > target ? "var(--kw-er)" : "var(--kw-subtle)" }}>
                            {Math.max(0, target - totals.calories)} kcal {ta ? "மீதம்" : "remaining"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
