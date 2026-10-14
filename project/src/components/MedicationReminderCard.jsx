import { useEffect, useState } from "react";
import KwIcon from "./icons/KwIcon";

/* ── Timing metadata — always 4 fixed slots ── */
const FIXED_SLOTS = [
    { key: "morning",   labelEn: "Morning",   labelTa: "காலை",   time: "08:00", order: 0 },
    { key: "afternoon", labelEn: "Afternoon", labelTa: "மதியம்", time: "13:00", order: 1 },
    { key: "evening",   labelEn: "Evening",   labelTa: "மாலை",   time: "18:00", order: 2 },
    { key: "night",     labelEn: "Night",     labelTa: "இரவு",   time: "22:00", order: 3 },
];

function nowMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
}

function slotStatus(timeStr) {
    if (!timeStr) return "upcoming";
    const [h, m] = timeStr.split(":").map(Number);
    const slotMin = h * 60 + m;
    const now     = nowMinutes();
    if (now > slotMin + 120) return "overdue";
    if (now >= slotMin - 30) return "due";
    return "upcoming";
}

/* ─────────────────── Full schedule popup ─────────────────── */
function SchedulePopup({ medications, medLogs, language, onToggle, onClose, onNavigate }) {
    const ta = language === "ta";

    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    /* Build full schedule including as_needed */
    const schedule = {};
    for (const med of medications.filter(m => m.active !== false)) {
        for (const timing of med.timings || []) {
            if (!schedule[timing]) schedule[timing] = [];
            schedule[timing].push(med);
        }
    }
    const allSlots = [
        ...FIXED_SLOTS,
        { key: "as_needed", labelEn: "As Needed", labelTa: "தேவைப்படும்", time: null },
    ].filter(s => schedule[s.key]?.length > 0);

    const totalDoses = Object.values(schedule).reduce((s, m) => s + m.length, 0);
    const takenDoses = Object.entries(schedule).reduce((s, [timing, meds]) =>
        s + meds.filter(m => medLogs[`${m.id}_${timing}`]).length, 0);
    const allDone = totalDoses > 0 && takenDoses === totalDoses;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.55)", backdropFilter: "blur(10px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog" aria-modal="true"
        >
            <div
                className="w-full max-w-md rounded-3xl flex flex-col"
                style={{
                    background: "var(--kw-surface)",
                    boxShadow: "var(--kw-shadow-xl)",
                    border: "1px solid var(--kw-line)",
                    maxHeight: "82vh",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <div>
                        <h3 className="font-display font-semibold font-tamil" style={{ fontSize: "1rem", color: "var(--kw-ink)" }}>
                            {ta ? "இன்றைய மருந்து அட்டவணை" : "Today's Medication Schedule"}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: allDone ? "var(--kw-brand-tint)" : "var(--kw-er-tint)", color: allDone ? "var(--kw-brand-ink)" : "var(--kw-er-deep)" }}>
                                {takenDoses}/{totalDoses} {ta ? "கொடுக்கப்பட்டது" : "administered"}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-muted)" }}>
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                    {allSlots.length === 0 && (
                        <p className="text-sm text-center py-6 font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "மருந்துகள் திட்டமிடப்படவில்லை." : "No medications scheduled today."}
                        </p>
                    )}
                    {allSlots.map(({ key: timing, labelEn, labelTa, time }) => {
                        const meds   = schedule[timing] || [];
                        const status = slotStatus(time);
                        return (
                            <div key={timing}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-muted)" }}>
                                        {ta ? labelTa : labelEn}
                                    </span>
                                    {time && <span className="text-[10px]" style={{ color: "var(--kw-subtle)" }}>{time}</span>}
                                    {status === "overdue" && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--kw-er-tint)", color: "var(--kw-er-deep)" }}>
                                            {ta ? "தாமதமானது" : "Overdue"}
                                        </span>
                                    )}
                                    {status === "due" && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>
                                            {ta ? "இப்போது" : "Due now"}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    {meds.map((med) => {
                                        const logKey = `${med.id}_${timing}`;
                                        const taken  = Boolean(medLogs[logKey]);
                                        return (
                                            <div
                                                key={med.id}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                                style={{
                                                    background: taken ? "var(--kw-brand-tint)" : "var(--kw-bg-deep)",
                                                    border: `1px solid ${taken ? "var(--kw-brand)44" : "var(--kw-line)"}`,
                                                    opacity: taken ? 0.75 : 1,
                                                }}
                                            >
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: med.color || "#64748b" }} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-sm font-semibold font-tamil" style={{ color: "var(--kw-ink)", textDecoration: taken ? "line-through" : "none" }}>
                                                            {med.name}
                                                        </span>
                                                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${med.color || "#64748b"}18`, color: med.color || "#64748b" }}>
                                                            {med.dosage}
                                                        </span>
                                                        {med.withFood && <span title={ta ? "உணவுடன்" : "With food"}>🍽</span>}
                                                    </div>
                                                    {med.instructions && (
                                                        <p className="text-[11px] mt-0.5 font-tamil truncate" style={{ color: "var(--kw-muted)" }}>{med.instructions}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => onToggle?.(logKey)}
                                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-[1.08]"
                                                    style={{
                                                        background: taken ? "var(--kw-brand)" : "var(--kw-surface)",
                                                        border: `1.5px solid ${taken ? "var(--kw-brand)" : "var(--kw-line-strong)"}`,
                                                        color: taken ? "white" : "var(--kw-muted)",
                                                    }}
                                                >
                                                    <KwIcon name={taken ? "check" : "plus"} size={13} strokeWidth={taken ? 3 : 2.5} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {allDone && (
                        <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: "var(--kw-brand-tint)", border: "1px solid var(--kw-brand)33" }}>
                            <p className="text-sm font-semibold font-tamil" style={{ color: "var(--kw-brand-ink)" }}>
                                {ta ? "இன்றைய அனைத்து மருந்துகளும் ✓" : "All medications administered for today! ✓"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {onNavigate && (
                    <div className="px-5 py-3.5 shrink-0" style={{ borderTop: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                        <button
                            onClick={() => { onClose(); onNavigate(); }}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold font-tamil transition-all hover:opacity-80"
                            style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)" }}
                        >
                            {ta ? "மருந்து மேலாண்மைக்கு செல் →" : "Manage medications →"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────── Compact board card — always 4 fixed rows ─────────────── */
export default function MedicationReminderCard({ medications = [], medLogs = {}, language, onNavigate, onToggle }) {
    const [showPopup, setShowPopup] = useState(false);

    const ta = language === "ta";

    /* Build per-slot med lists */
    const slotMeds = {};
    for (const med of medications.filter(m => m.active !== false)) {
        for (const timing of med.timings || []) {
            if (!slotMeds[timing]) slotMeds[timing] = [];
            slotMeds[timing].push(med);
        }
    }

    const totalDoses = FIXED_SLOTS.reduce((s, sl) => s + (slotMeds[sl.key]?.length || 0), 0);
    const takenDoses = FIXED_SLOTS.reduce((s, sl) =>
        s + (slotMeds[sl.key] || []).filter(m => medLogs[`${m.id}_${sl.key}`]).length, 0);
    const allDone = totalDoses > 0 && takenDoses === totalDoses;

    return (
        <>
            <div
                className="rounded-2xl p-4"
                style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-subtle)" }}>
                            {ta ? "மருந்து நினைவூட்டல்" : "Medication Schedule"}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: allDone && totalDoses > 0 ? "var(--kw-brand)" : totalDoses === 0 ? "var(--kw-subtle)" : "var(--kw-er)" }}
                            />
                            <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--kw-ink)" }}>
                                {takenDoses}/{totalDoses}
                            </span>
                            <span className="text-[13px] font-tamil" style={{ color: "var(--kw-muted)" }}>
                                {ta ? "கொடுக்கப்பட்டது" : "administered today"}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPopup(true)}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-80 font-tamil"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-bg-deep)" }}
                    >
                        {ta ? "விவரம்" : "View all"}
                    </button>
                </div>

                {/* ── Always-4 fixed-height slot rows ── */}
                <div className="space-y-1.5">
                    {FIXED_SLOTS.map((slot) => {
                        const meds       = slotMeds[slot.key] || [];
                        const hasMeds    = meds.length > 0;
                        const status     = slotStatus(slot.time);
                        const takenCount = meds.filter(m => medLogs[`${m.id}_${slot.key}`]).length;
                        const allTaken   = hasMeds && takenCount === meds.length;

                        return (
                            <div
                                key={slot.key}
                                className="flex items-center gap-2.5 px-3 rounded-xl"
                                style={{
                                    background: allTaken ? "var(--kw-brand-tint)" : "var(--kw-bg-deep)",
                                    border: `1px solid ${allTaken ? "var(--kw-brand)44" : "var(--kw-line)"}`,
                                    height: 48,               /* fixed — never moves */
                                    minHeight: 48,
                                    maxHeight: 48,
                                }}
                            >
                                {/* Slot label — fixed width */}
                                <div style={{ width: 84, flexShrink: 0 }}>
                                    <div
                                        className="text-[10px] font-bold uppercase tracking-[0.1em] font-tamil leading-none"
                                        style={{ color: hasMeds ? "var(--kw-ink-soft)" : "var(--kw-subtle)" }}
                                    >
                                        {ta ? slot.labelTa : slot.labelEn}
                                    </div>
                                    <div className="text-[10px] mt-0.5" style={{ color: "var(--kw-subtle)" }}>
                                        {slot.time}
                                    </div>
                                </div>

                                {/* Med chips — overflow truncated */}
                                <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                                    {!hasMeds ? (
                                        <span className="text-[11px]" style={{ color: "var(--kw-subtle)" }}>—</span>
                                    ) : (
                                        <>
                                            {meds.slice(0, 3).map((med) => {
                                                const taken = Boolean(medLogs[`${med.id}_${slot.key}`]);
                                                return (
                                                    <span
                                                        key={med.id}
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full font-tamil shrink-0"
                                                        style={{
                                                            background: taken ? `${med.color || "#64748b"}22` : `${med.color || "#64748b"}12`,
                                                            color: taken ? "var(--kw-muted)" : "var(--kw-ink-soft)",
                                                            textDecoration: taken ? "line-through" : "none",
                                                            border: `1px solid ${med.color || "#64748b"}30`,
                                                        }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: taken ? "var(--kw-brand)" : (med.color || "#64748b") }} />
                                                        {med.name}
                                                    </span>
                                                );
                                            })}
                                            {meds.length > 3 && (
                                                <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--kw-muted)" }}>+{meds.length - 3}</span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Right badge — fixed width, no reflow */}
                                <div style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
                                    {allTaken ? (
                                        <span className="inline-flex w-5 h-5 rounded-full items-center justify-center" style={{ background: "var(--kw-brand)", color: "white" }}>
                                            <KwIcon name="check" size={9} strokeWidth={3} />
                                        </span>
                                    ) : hasMeds && status === "overdue" ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--kw-er-tint)", color: "var(--kw-er-deep)" }}>
                                            {ta ? "தாமதம்" : "Late"}
                                        </span>
                                    ) : hasMeds && status === "due" ? (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>
                                            {ta ? "இப்போது" : "Now"}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showPopup && (
                <SchedulePopup
                    medications={medications}
                    medLogs={medLogs}
                    language={language}
                    onToggle={onToggle}
                    onClose={() => setShowPopup(false)}
                    onNavigate={onNavigate}
                />
            )}
        </>
    );
}
