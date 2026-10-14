import { useState, useMemo, useCallback } from "react";
import { MACRO_COLORS } from "../components/DietSummaryCard";
import KwIcon from "../components/icons/KwIcon";

/* ── Week helpers ── */
function getWeekStart(offset = 0) {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/** Returns YYYY-MM-DD in LOCAL time — never UTC — to avoid timezone off-by-one errors. */
function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDay(d, ta) {
    return d.toLocaleDateString(ta ? "ta-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function fmtFullDay(d, ta) {
    return d.toLocaleDateString(ta ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" });
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS = [
    { key: "breakfast", labelEn: "Breakfast", labelTa: "காலை உணவு", color: "#f97316" },
    { key: "lunch",     labelEn: "Lunch",     labelTa: "மதிய உணவு",   color: "#22c55e" },
    { key: "dinner",    labelEn: "Dinner",    labelTa: "இரவு உணவு",   color: "#3b82f6" },
    { key: "snacks",    labelEn: "Snacks",    labelTa: "சிற்றுண்டி",  color: "#a855f7" },
];

const EMPTY_ENTRY = { food: "", portion: "", calories: "", protein: "", carbs: "", fat: "", fiber: "", notes: "" };

/* ── Macro summary for a meal list ── */
function sumEntries(entries = []) {
    return entries.reduce(
        (a, e) => ({
            calories: a.calories + (Number(e.calories) || 0),
            protein:  a.protein  + (Number(e.protein)  || 0),
            carbs:    a.carbs    + (Number(e.carbs)     || 0),
            fat:      a.fat      + (Number(e.fat)       || 0),
            fiber:    a.fiber    + (Number(e.fiber)     || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
}

/* ── Number input for macros ── */
function NumInput({ value, onChange, placeholder, min = 0 }) {
    return (
        <input
            type="number"
            min={min}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg px-2.5 py-1.5 text-sm font-semibold tabular-nums text-right"
            style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)", outline: "none" }}
        />
    );
}

/* ── Food entry modal ── */
function FoodEntryModal({ date, meal, entries, onClose, onAdd, onDelete, language }) {
    const ta = language === "ta";
    const mealMeta = MEALS.find(m => m.key === meal);
    const [form, setForm] = useState({ ...EMPTY_ENTRY });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.food.trim()) e.food = true;
        if (form.calories !== "" && Number(form.calories) < 0) e.calories = true;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAdd = () => {
        if (!validate()) return;
        onAdd({ ...form, id: Date.now().toString() });
        setForm({ ...EMPTY_ENTRY });
    };

    const totals = sumEntries(entries);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.5)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{ background: "var(--kw-surface)", boxShadow: "var(--kw-shadow-xl)", maxHeight: "90vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <div>
                        <div
                            className="text-[10px] font-bold uppercase tracking-[0.14em] mb-0.5"
                            style={{ color: mealMeta?.color || "var(--kw-brand)" }}
                        >
                            {ta ? mealMeta?.labelTa : mealMeta?.labelEn}
                        </div>
                        <h3 className="font-display font-semibold font-tamil" style={{ fontSize: "1rem", color: "var(--kw-ink)" }}>
                            {fmtFullDay(new Date(date + "T00:00:00"), ta)}
                        </h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-muted)" }}>
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                    {/* Existing entries */}
                    {entries.length > 0 && (
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--kw-muted)" }}>
                                {ta ? "பதிவு செய்யப்பட்ட உணவுகள்" : "Logged foods"} ({entries.length})
                            </div>
                            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--kw-line)" }}>
                                {/* Table header */}
                                <div className="grid text-[10px] font-bold uppercase tracking-wider px-3 py-2" style={{ gridTemplateColumns: "1fr 60px 55px 50px 50px 36px", background: "var(--kw-bg-deep)", color: "var(--kw-muted)", gap: "8px" }}>
                                    <span>{ta ? "உணவு" : "Food"}</span>
                                    <span className="text-right" style={{ color: MACRO_COLORS.calories }}>kcal</span>
                                    <span className="text-right" style={{ color: MACRO_COLORS.protein }}>P (g)</span>
                                    <span className="text-right" style={{ color: MACRO_COLORS.carbs }}>C (g)</span>
                                    <span className="text-right" style={{ color: MACRO_COLORS.fat }}>F (g)</span>
                                    <span />
                                </div>
                                {entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="grid items-center px-3 py-2.5"
                                        style={{ gridTemplateColumns: "1fr 60px 55px 50px 50px 36px", gap: "8px", borderTop: "1px solid var(--kw-line)" }}
                                    >
                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm font-tamil truncate" style={{ color: "var(--kw-ink)" }}>{entry.food}</div>
                                            {entry.portion && <div className="text-[11px]" style={{ color: "var(--kw-muted)" }}>{entry.portion}</div>}
                                        </div>
                                        <span className="text-sm font-bold tabular-nums text-right" style={{ color: MACRO_COLORS.calories }}>{entry.calories || "—"}</span>
                                        <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.protein }}>{entry.protein || "—"}</span>
                                        <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.carbs }}>{entry.carbs || "—"}</span>
                                        <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.fat }}>{entry.fat || "—"}</span>
                                        <button onClick={() => onDelete(entry.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70" style={{ color: "var(--kw-er)", background: "var(--kw-er-tint)" }}>
                                            <KwIcon name="trash" size={13} strokeWidth={2} />
                                        </button>
                                    </div>
                                ))}
                                {/* Totals row */}
                                <div
                                    className="grid items-center px-3 py-2.5 font-bold"
                                    style={{ gridTemplateColumns: "1fr 60px 55px 50px 50px 36px", gap: "8px", borderTop: "2px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}
                                >
                                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--kw-muted)" }}>{ta ? "மொத்தம்" : "Total"}</span>
                                    <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.calories }}>{totals.calories}</span>
                                    <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.protein }}>{Math.round(totals.protein)}</span>
                                    <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.carbs }}>{Math.round(totals.carbs)}</span>
                                    <span className="text-sm tabular-nums text-right" style={{ color: MACRO_COLORS.fat }}>{Math.round(totals.fat)}</span>
                                    <span />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add new entry form */}
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "புதிய உணவு சேர்க்கவும்" : "Add food item"}
                        </div>
                        <div className="space-y-3">
                            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                                        {ta ? "உணவு பெயர் *" : "Food name *"}
                                    </label>
                                    <input
                                        value={form.food}
                                        onChange={(e) => setForm(f => ({ ...f, food: e.target.value }))}
                                        placeholder={ta ? "எ.கா. சோறு" : "e.g. Brown rice, 1 cup"}
                                        className="w-full rounded-lg px-3 py-2 text-sm font-tamil"
                                        style={{
                                            background: "var(--kw-bg-deep)",
                                            border: `1px solid ${errors.food ? "var(--kw-er)" : "var(--kw-line)"}`,
                                            color: "var(--kw-ink)", outline: "none"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold mb-1 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                                        {ta ? "அளவு" : "Portion"}
                                    </label>
                                    <input
                                        value={form.portion}
                                        onChange={(e) => setForm(f => ({ ...f, portion: e.target.value }))}
                                        placeholder="100g / 1 cup"
                                        className="w-full rounded-lg px-3 py-2 text-sm"
                                        style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)", outline: "none", minWidth: 90 }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    { key: "calories", label: "Kcal", labelTa: "கலோரி", color: MACRO_COLORS.calories },
                                    { key: "protein",  label: "Protein (g)", labelTa: "புரதம் (g)", color: MACRO_COLORS.protein },
                                    { key: "carbs",    label: "Carbs (g)",   labelTa: "கார்ப் (g)", color: MACRO_COLORS.carbs },
                                    { key: "fat",      label: "Fat (g)",     labelTa: "கொழுப்பு (g)", color: MACRO_COLORS.fat },
                                    { key: "fiber",    label: "Fiber (g)",   labelTa: "நார் (g)",    color: MACRO_COLORS.fiber },
                                ].map(({ key, label, labelTa, color }) => (
                                    <div key={key}>
                                        <label className="text-[10px] font-bold mb-1 block" style={{ color }}>
                                            {ta ? labelTa : label}
                                        </label>
                                        <NumInput
                                            value={form[key]}
                                            onChange={(v) => setForm(f => ({ ...f, [key]: v }))}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="text-xs font-semibold mb-1 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                                    {ta ? "குறிப்புகள் (விருப்பம்)" : "Notes (optional)"}
                                </label>
                                <input
                                    value={form.notes}
                                    onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder={ta ? "எ.கா. வீட்டில் சமைத்தது" : "e.g. home-cooked, low-sodium"}
                                    className="w-full rounded-lg px-3 py-2 text-sm font-tamil"
                                    style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)", outline: "none" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border font-tamil transition-all hover:opacity-80"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-surface)" }}
                    >
                        {ta ? "மூடு" : "Close"}
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!form.food.trim()}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white font-tamil transition-all"
                        style={{
                            background: form.food.trim() ? (mealMeta?.color || "var(--kw-brand)") : "var(--kw-line-strong)",
                            cursor: form.food.trim() ? "pointer" : "not-allowed",
                        }}
                    >
                        {ta ? "+ சேர்" : "+ Add entry"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Table cell ── */
function MealCell({ entries, mealColor, onClick, ta }) {
    const t = sumEntries(entries);
    const hasData = entries.length > 0;
    return (
        <button
            onClick={onClick}
            className="w-full rounded-xl p-2.5 text-left transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[68px]"
            style={{
                background: hasData ? `${mealColor}10` : "var(--kw-bg-deep)",
                border: `1px solid ${hasData ? `${mealColor}44` : "var(--kw-line)"}`,
            }}
        >
            {hasData ? (
                <>
                    <div className="font-bold tabular-nums text-sm leading-tight" style={{ color: mealColor }}>{t.calories}<span className="text-[10px] font-normal ml-0.5" style={{ color: "var(--kw-muted)" }}>kcal</span></div>
                    <div className="text-[10px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                        {entries.length} {ta ? "உணவு" : "item" + (entries.length > 1 ? "s" : "")}
                    </div>
                    <div className="text-[10px] mt-1 tabular-nums flex gap-2 flex-wrap">
                        {t.protein > 0  && <span style={{ color: MACRO_COLORS.protein }}>P{Math.round(t.protein)}g</span>}
                        {t.carbs > 0    && <span style={{ color: MACRO_COLORS.carbs }}>C{Math.round(t.carbs)}g</span>}
                        {t.fat > 0      && <span style={{ color: MACRO_COLORS.fat }}>F{Math.round(t.fat)}g</span>}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-1 text-xs font-semibold font-tamil" style={{ color: "var(--kw-subtle)" }}>
                    <KwIcon name="plus" size={13} strokeWidth={2.5} />
                    {ta ? "சேர்" : "Add"}
                </div>
            )}
        </button>
    );
}

/* ── Macro summary bar ── */
function SummaryBar({ label, value, max, color, unit = "g" }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] w-12 font-tamil" style={{ color: "var(--kw-muted)" }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--kw-line)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-[11px] font-bold tabular-nums w-12 text-right" style={{ color }}>{Math.round(value)}{unit}</span>
        </div>
    );
}

/* ── Goal settings row ── */
function GoalInput({ label, value, onChange, unit, color }) {
    return (
        <div className="flex items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--kw-line)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <span className="flex-1 text-sm font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>{label}</span>
            <input
                type="number" min="0"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-20 text-right rounded-lg px-2 py-1 text-sm font-bold tabular-nums"
                style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color, outline: "none" }}
            />
            <span className="text-xs w-6" style={{ color: "var(--kw-muted)" }}>{unit}</span>
        </div>
    );
}

/* ── Main view ── */
export default function DietView({ dietData = {}, dietGoals = {}, onAddEntry, onDeleteEntry, onGoalUpdate, language, patient }) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedCell, setSelectedCell] = useState(null); // { date, meal }
    const [showGoals, setShowGoals] = useState(false);

    const ta = language === "ta";
    const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
    const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);

    const weekEnd = days[6];
    const weekLabel = `${days[0].toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

    const today = isoDate(new Date());
    const firstName = patient?.firstName || patient?.name?.split(" ")[0] || "";

    /* Weekly grand totals */
    const weekTotals = useMemo(() => {
        const acc = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        for (const d of days) {
            const dayData = dietData[isoDate(d)] || {};
            for (const meal of MEALS) {
                const t = sumEntries(dayData[meal.key] || []);
                acc.calories += t.calories;
                acc.protein  += t.protein;
                acc.carbs    += t.carbs;
                acc.fat      += t.fat;
                acc.fiber    += t.fiber;
            }
        }
        return acc;
    }, [dietData, days]);

    /* Meal column totals for the week */
    const mealTotals = useMemo(() => {
        return MEALS.reduce((obj, m) => {
            obj[m.key] = days.reduce((acc, d) => {
                const t = sumEntries((dietData[isoDate(d)] || {})[m.key] || []);
                return { calories: acc.calories + t.calories, protein: acc.protein + t.protein, carbs: acc.carbs + t.carbs, fat: acc.fat + t.fat, fiber: acc.fiber + t.fiber };
            }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
            return obj;
        }, {});
    }, [dietData, days]);

    const goals = { calories: 2000, protein: 50, carbs: 250, fat: 65, fiber: 25, ...dietGoals };

    const selectedEntries = selectedCell
        ? ((dietData[selectedCell.date] || {})[selectedCell.meal] || [])
        : [];

    return (
        <>
            {/* Page header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: "var(--kw-brand)" }}>
                        {ta ? "உணவு அட்டவணை" : "Diet Chart"}
                    </div>
                    <h1 className="font-display font-semibold font-tamil" style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", color: "var(--kw-ink)", letterSpacing: "-0.025em" }}>
                        {ta ? `${firstName} · வாராந்திர உணவு பதிவு` : `${firstName} · Weekly Food Log`}
                    </h1>
                    <p className="text-sm font-tamil mt-1" style={{ color: "var(--kw-muted)" }}>
                        {ta ? "ஊட்டச்சத்து நிபுணர் பயன்பாட்டிற்கான வாராந்திர உணவு அட்டவணை." : "Nutritionist-grade weekly food diary with macro tracking."}
                    </p>
                </div>
                <button
                    onClick={() => setShowGoals(v => !v)}
                    className="shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80 font-tamil"
                    style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: showGoals ? "var(--kw-brand-tint)" : "var(--kw-bg-deep)", borderColor: showGoals ? "var(--kw-brand)" : "var(--kw-line)" }}
                >
                    🎯 {ta ? "இலக்குகள்" : "Daily Goals"}
                </button>
            </div>

            {/* Daily goals panel */}
            {showGoals && (
                <div className="rounded-3xl p-5 mb-5" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--kw-brand)" }}>
                        {ta ? "தினசரி ஊட்டச்சத்து இலக்குகள்" : "Daily Nutritional Targets"}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-8">
                        <GoalInput label={ta ? "கலோரி" : "Calories"}         value={goals.calories} onChange={(v) => onGoalUpdate("calories", v)} unit="kcal" color={MACRO_COLORS.calories} />
                        <GoalInput label={ta ? "புரதம்"         : "Protein"}  value={goals.protein}  onChange={(v) => onGoalUpdate("protein",  v)} unit="g"    color={MACRO_COLORS.protein} />
                        <GoalInput label={ta ? "கார்போஹைட்ரேட்" : "Carbs"}   value={goals.carbs}    onChange={(v) => onGoalUpdate("carbs",    v)} unit="g"    color={MACRO_COLORS.carbs} />
                        <GoalInput label={ta ? "கொழுப்பு"       : "Fat"}     value={goals.fat}      onChange={(v) => onGoalUpdate("fat",      v)} unit="g"    color={MACRO_COLORS.fat} />
                        <GoalInput label={ta ? "நார்ச்சத்து"    : "Fiber"}   value={goals.fiber}    onChange={(v) => onGoalUpdate("fiber",    v)} unit="g"    color={MACRO_COLORS.fiber} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
                {/* ── Weekly table ── */}
                <div className="rounded-3xl overflow-hidden" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
                    {/* Week nav */}
                    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                        <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)" }}>
                            <KwIcon name="chevronRight" size={16} strokeWidth={2.5} className="rotate-180" />
                        </button>
                        <div className="text-center">
                            <div className="font-display font-semibold text-sm" style={{ color: "var(--kw-ink)" }}>{weekLabel}</div>
                            {weekOffset === 0 && <div className="text-[10px] font-bold" style={{ color: "var(--kw-brand)" }}>{ta ? "தற்போதைய வாரம்" : "Current week"}</div>}
                        </div>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)" }}>
                            <KwIcon name="chevronRight" size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ minWidth: 640 }}>
                            {/* Meal column headers */}
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-wider w-[110px]" style={{ color: "var(--kw-muted)", borderBottom: "1px solid var(--kw-line)" }}>
                                        {ta ? "நாள்" : "Day"}
                                    </th>
                                    {MEALS.map(m => (
                                        <th key={m.key} className="py-3 px-2 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: m.color, borderBottom: "1px solid var(--kw-line)" }}>
                                            {ta ? m.labelTa : m.labelEn}
                                        </th>
                                    ))}
                                    <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-wider" style={{ color: MACRO_COLORS.calories, borderBottom: "1px solid var(--kw-line)" }}>
                                        {ta ? "தினம்" : "Day total"}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {days.map((d, idx) => {
                                    const dateStr = isoDate(d);
                                    const isToday = dateStr === today;
                                    const dayData = dietData[dateStr] || {};
                                    const dayTotal = MEALS.reduce((acc, m) => {
                                        const t = sumEntries(dayData[m.key] || []);
                                        return { calories: acc.calories + t.calories, protein: acc.protein + t.protein };
                                    }, { calories: 0, protein: 0 });

                                    return (
                                        <tr key={dateStr} style={{ background: isToday ? "var(--kw-brand-tint)" : idx % 2 === 0 ? "transparent" : "var(--kw-bg-deep)" }}>
                                            <td className="py-2.5 px-4" style={{ borderBottom: "1px solid var(--kw-line)" }}>
                                                <div className="font-semibold text-xs font-tamil leading-tight" style={{ color: isToday ? "var(--kw-brand)" : "var(--kw-ink)" }}>
                                                    {d.toLocaleDateString(ta ? "ta-IN" : "en-IN", { weekday: "short" })}
                                                </div>
                                                <div className="text-[10px]" style={{ color: isToday ? "var(--kw-brand)" : "var(--kw-muted)" }}>
                                                    {d.toLocaleDateString(ta ? "ta-IN" : "en-IN", { day: "numeric", month: "short" })}
                                                    {isToday && <span className="ml-1 font-bold">{ta ? "·இன்று" : "·today"}</span>}
                                                </div>
                                            </td>
                                            {MEALS.map(m => (
                                                <td key={m.key} className="py-2 px-2" style={{ borderBottom: "1px solid var(--kw-line)" }}>
                                                    <MealCell
                                                        entries={dayData[m.key] || []}
                                                        mealColor={m.color}
                                                        ta={ta}
                                                        onClick={() => setSelectedCell({ date: dateStr, meal: m.key })}
                                                    />
                                                </td>
                                            ))}
                                            <td className="py-2.5 px-3 text-right" style={{ borderBottom: "1px solid var(--kw-line)" }}>
                                                {dayTotal.calories > 0 ? (
                                                    <>
                                                        <div className="font-bold tabular-nums text-sm" style={{ color: MACRO_COLORS.calories }}>{dayTotal.calories}</div>
                                                        <div className="text-[10px]" style={{ color: "var(--kw-muted)" }}>kcal</div>
                                                    </>
                                                ) : (
                                                    <span style={{ color: "var(--kw-subtle)" }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Weekly total row */}
                                <tr style={{ background: "var(--kw-bg-deep)" }}>
                                    <td className="py-3 px-4">
                                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--kw-muted)" }}>
                                            {ta ? "வார மொத்தம்" : "Week total"}
                                        </div>
                                    </td>
                                    {MEALS.map(m => (
                                        <td key={m.key} className="py-3 px-2 text-center">
                                            {mealTotals[m.key]?.calories > 0 ? (
                                                <div className="text-xs font-bold tabular-nums" style={{ color: m.color }}>
                                                    {mealTotals[m.key].calories}<span className="font-normal text-[10px] ml-0.5" style={{ color: "var(--kw-muted)" }}>kcal</span>
                                                </div>
                                            ) : <span style={{ color: "var(--kw-subtle)" }}>—</span>}
                                        </td>
                                    ))}
                                    <td className="py-3 px-3 text-right">
                                        <div className="font-bold tabular-nums" style={{ color: MACRO_COLORS.calories }}>{weekTotals.calories}<span className="text-[10px] font-normal ml-0.5" style={{ color: "var(--kw-muted)" }}>kcal</span></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Weekly nutrition summary sidebar ── */}
                <div className="space-y-4">
                    <div className="rounded-3xl p-5" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: "var(--kw-brand)" }}>
                            {ta ? "வார ஊட்டச்சத்து சுருக்கம்" : "Weekly Nutrition Summary"}
                        </div>

                        {/* Donut */}
                        <div className="flex justify-center mb-5">
                            <div style={{ width: 120, height: 120, position: "relative" }}>
                                {(() => {
                                    const pKcal = weekTotals.protein * 4;
                                    const cKcal = weekTotals.carbs * 4;
                                    const fKcal = weekTotals.fat * 9;
                                    const total = pKcal + cKcal + fKcal || 1;
                                    const pDeg = (pKcal / total) * 360;
                                    const cDeg = (cKcal / total) * 360;
                                    const empty = weekTotals.calories === 0;
                                    const gradient = empty
                                        ? `conic-gradient(var(--kw-line) 0deg 360deg)`
                                        : `conic-gradient(${MACRO_COLORS.protein} 0deg ${pDeg}deg, ${MACRO_COLORS.carbs} ${pDeg}deg ${pDeg + cDeg}deg, ${MACRO_COLORS.fat} ${pDeg + cDeg}deg 360deg)`;
                                    return (
                                        <div style={{ width: 120, height: 120, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--kw-surface)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: empty ? "var(--kw-subtle)" : MACRO_COLORS.calories, letterSpacing: "-0.02em", lineHeight: 1 }}>{empty ? "—" : weekTotals.calories}</span>
                                                <span style={{ fontSize: "0.48rem", fontWeight: 700, color: "var(--kw-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>kcal / week</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <SummaryBar label={ta ? "புரதம்" : "Protein"} value={weekTotals.protein} max={goals.protein * 7} color={MACRO_COLORS.protein} />
                            <SummaryBar label={ta ? "கார்ப்" : "Carbs"}   value={weekTotals.carbs}   max={goals.carbs * 7}   color={MACRO_COLORS.carbs} />
                            <SummaryBar label={ta ? "கொழுப்பு" : "Fat"}   value={weekTotals.fat}     max={goals.fat * 7}     color={MACRO_COLORS.fat} />
                            <SummaryBar label={ta ? "நார்" : "Fiber"}     value={weekTotals.fiber}   max={goals.fiber * 7}   color={MACRO_COLORS.fiber} />
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="rounded-2xl p-4" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "வண்ண விளக்கம்" : "Colour legend"}
                        </div>
                        {MEALS.map(m => (
                            <div key={m.key} className="flex items-center gap-2 py-1">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                                <span className="text-xs font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>{ta ? m.labelTa : m.labelEn}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Food entry modal */}
            {selectedCell && (
                <FoodEntryModal
                    date={selectedCell.date}
                    meal={selectedCell.meal}
                    entries={selectedEntries}
                    language={language}
                    onClose={() => setSelectedCell(null)}
                    onAdd={(entry) => onAddEntry(selectedCell.date, selectedCell.meal, entry)}
                    onDelete={(id) => onDeleteEntry(selectedCell.date, selectedCell.meal, id)}
                />
            )}
        </>
    );
}
