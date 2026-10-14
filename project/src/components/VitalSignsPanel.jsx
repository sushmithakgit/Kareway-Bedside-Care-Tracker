import { useEffect, useState } from "react";
import KwIcon from "./icons/KwIcon";

/* ── Normal ranges & config ── */
const VITALS_CONFIG = [
    {
        key: "temperature",
        labelEn: "Temp",      labelTa: "வெப்பம்",
        unit: "°C",           icon: "thermometer",
        color: "#f97316",
        normal: [36.1, 37.5],
        borderline: [35.5, 38.5],
        decimals: 1,
        step: 0.1,
        min: 34, max: 42,
        placeholder: "36.8",
    },
    {
        key: "bp",
        labelEn: "Blood Pressure", labelTa: "BP",
        unit: "mmHg",         icon: "heartRate",
        color: "#ef4444",
        isBP: true,
        normal: { sys: [90, 120], dia: [60, 80] },
        borderline: { sys: [80, 140], dia: [50, 90] },
        placeholder: "120/80",
    },
    {
        key: "spo2",
        labelEn: "SpO₂",      labelTa: "SpO₂",
        unit: "%",            icon: "dropFill",
        color: "#3b82f6",
        normal: [94, 100],
        borderline: [90, 100],
        decimals: 0,
        step: 1,
        min: 70, max: 100,
        placeholder: "98",
    },
    {
        key: "pulse",
        labelEn: "Pulse",     labelTa: "நாடி",
        unit: "bpm",          icon: "heartRate",
        color: "#ec4899",
        normal: [60, 100],
        borderline: [50, 120],
        decimals: 0,
        step: 1,
        min: 30, max: 250,
        placeholder: "72",
    },
    {
        key: "rr",
        labelEn: "Resp Rate", labelTa: "சுவாசம்",
        unit: "/min",         icon: "lungs",
        color: "#22c55e",
        normal: [12, 20],
        borderline: [10, 25],
        decimals: 0,
        step: 1,
        min: 4, max: 60,
        placeholder: "16",
    },
];

/* ── Status helpers ── */
function getVitalStatus(cfg, reading) {
    if (reading == null || reading === "") return "none";
    if (cfg.isBP) {
        const { sys, dia } = reading;
        if (sys == null || dia == null) return "none";
        const inNormal  = sys >= cfg.normal.sys[0]     && sys <= cfg.normal.sys[1]     && dia >= cfg.normal.dia[0]     && dia <= cfg.normal.dia[1];
        const inBorder  = sys >= cfg.borderline.sys[0] && sys <= cfg.borderline.sys[1] && dia >= cfg.borderline.dia[0] && dia <= cfg.borderline.dia[1];
        if (inNormal)  return "normal";
        if (inBorder)  return "borderline";
        return "abnormal";
    }
    const val = Number(reading);
    if (isNaN(val)) return "none";
    if (val >= cfg.normal[0] && val <= cfg.normal[1]) return "normal";
    if (val >= cfg.borderline[0] && val <= cfg.borderline[1]) return "borderline";
    return "abnormal";
}

const STATUS_COLORS = {
    normal:     { dot: "#22c55e", label: "Normal",        labelTa: "சாதாரண" },
    borderline: { dot: "#f59e0b", label: "Borderline",    labelTa: "எல்லை" },
    abnormal:   { dot: "#ef4444", label: "Abnormal",      labelTa: "அசாதாரண" },
    none:       { dot: "var(--kw-subtle)", label: "—",    labelTa: "—" },
};

function getTrend(readings, key, isBP) {
    if (readings.length < 2) return null;
    const latest = readings[readings.length - 1];
    const prev   = readings[readings.length - 2];
    if (isBP) {
        const latestSys = latest[key]?.sys;
        const prevSys   = prev[key]?.sys;
        if (latestSys == null || prevSys == null) return null;
        if (latestSys > prevSys + 2) return "up";
        if (latestSys < prevSys - 2) return "down";
        return "stable";
    }
    const l = Number(latest[key]);
    const p = Number(prev[key]);
    if (isNaN(l) || isNaN(p)) return null;
    if (l > p + 0.5) return "up";
    if (l < p - 0.5) return "down";
    return "stable";
}

function fmtValue(cfg, reading) {
    if (reading == null || reading === "") return "—";
    if (cfg.isBP) {
        if (reading.sys == null) return "—";
        return `${reading.sys}/${reading.dia}`;
    }
    const n = Number(reading);
    return isNaN(n) ? "—" : cfg.decimals ? n.toFixed(cfg.decimals) : String(Math.round(n));
}

function fmtAge(isoTs) {
    if (!isoTs) return null;
    const mins = Math.round((Date.now() - new Date(isoTs).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/* ─────────────── Vitals entry modal ─────────────── */
function VitalsEntryModal({ language, onSave, onClose, latestReading }) {
    const ta = language === "ta";
    const [form, setForm] = useState(() => {
        const base = { temperature: "", spo2: "", pulse: "", rr: "", bp_sys: "", bp_dia: "", notes: "" };
        if (latestReading) {
            return {
                ...base,
                temperature: latestReading.temperature ?? "",
                spo2:        latestReading.spo2        ?? "",
                pulse:       latestReading.pulse       ?? "",
                rr:          latestReading.rr          ?? "",
                bp_sys:      latestReading.bp?.sys     ?? "",
                bp_dia:      latestReading.bp?.dia     ?? "",
            };
        }
        return base;
    });

    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    const handleSave = () => {
        const entry = {
            id:          Date.now().toString(),
            timestamp:   new Date().toISOString(),
            temperature: form.temperature !== "" ? Number(form.temperature) : null,
            spo2:        form.spo2        !== "" ? Number(form.spo2)        : null,
            pulse:       form.pulse       !== "" ? Number(form.pulse)       : null,
            rr:          form.rr          !== "" ? Number(form.rr)          : null,
            bp:          form.bp_sys !== "" && form.bp_dia !== ""
                ? { sys: Number(form.bp_sys), dia: Number(form.bp_dia) }
                : null,
            notes: form.notes,
        };
        onSave(entry);
        onClose();
    };

    const inp = (k, placeholder, type = "number", extraStyle = {}) => (
        <input
            type={type}
            value={form[k]}
            onChange={(e) => setForm(f => ({ ...f, [k]: e.target.value }))}
            placeholder={placeholder}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-bold tabular-nums"
            style={{
                background: "var(--kw-bg-deep)",
                border: "1px solid var(--kw-line)",
                color: "var(--kw-ink)",
                outline: "none",
                ...extraStyle,
            }}
        />
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.55)", backdropFilter: "blur(10px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog" aria-modal="true"
        >
            <div
                className="w-full max-w-sm rounded-3xl overflow-hidden"
                style={{ background: "var(--kw-surface)", boxShadow: "var(--kw-shadow-xl)", border: "1px solid var(--kw-line)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <div>
                        <h3 className="font-display font-semibold font-tamil" style={{ fontSize: "1rem", color: "var(--kw-ink)" }}>
                            {ta ? "உயிர் அறிகுறிகள் பதிவு" : "Log Vital Signs"}
                        </h3>
                        <p className="text-[11px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "தற்போதைய அளவீடுகளை உள்ளிடவும்" : "Enter current measurements"}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-muted)" }}>
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3">
                    {/* Temperature */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#f97316" }}>
                                {ta ? "வெப்பநிலை (°C)" : "Temperature (°C)"}
                            </label>
                            {inp("temperature", "36.8")}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#3b82f6" }}>
                                SpO₂ (%)
                            </label>
                            {inp("spo2", "98")}
                        </div>
                    </div>

                    {/* BP */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#ef4444" }}>
                            {ta ? "இரத்த அழுத்தம் (mmHg)" : "Blood Pressure (mmHg)"}
                        </label>
                        <div className="flex items-center gap-2">
                            {inp("bp_sys", "120", "number", { textAlign: "center" })}
                            <span className="font-bold text-lg shrink-0" style={{ color: "var(--kw-muted)" }}>/</span>
                            {inp("bp_dia", "80", "number", { textAlign: "center" })}
                        </div>
                        <div className="flex justify-between mt-0.5 px-1">
                            <span className="text-[10px]" style={{ color: "var(--kw-muted)" }}>{ta ? "சிஸ்டோலிக்" : "Systolic"}</span>
                            <span className="text-[10px]" style={{ color: "var(--kw-muted)" }}>{ta ? "டயஸ்டோலிக்" : "Diastolic"}</span>
                        </div>
                    </div>

                    {/* Pulse + RR */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#ec4899" }}>
                                {ta ? "நாடி (bpm)" : "Pulse (bpm)"}
                            </label>
                            {inp("pulse", "72")}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#22c55e" }}>
                                {ta ? "சுவாசம் (/நிமி)" : "Resp Rate (/min)"}
                            </label>
                            {inp("rr", "16")}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "குறிப்புகள் (விருப்பம்)" : "Notes (optional)"}
                        </label>
                        <input
                            type="text"
                            value={form.notes}
                            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder={ta ? "எ.கா. நோயாளர் அமர்ந்த நிலையில்" : "e.g. patient sitting, post-exercise"}
                            className="w-full rounded-lg px-3 py-2.5 text-sm font-tamil"
                            style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)", outline: "none" }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border font-tamil" style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-surface)" }}>
                        {ta ? "ரத்து" : "Cancel"}
                    </button>
                    <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white font-tamil" style={{ background: "var(--kw-brand)" }}>
                        {ta ? "சேமி" : "Save Reading"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────── Board panel ─────────────── */
export default function VitalSignsPanel({ vitals = [], language, onLog }) {
    const [showModal, setShowModal] = useState(false);
    const ta = language === "ta";

    const latest   = vitals.length > 0 ? vitals[vitals.length - 1] : null;
    const lastTime = latest ? fmtAge(latest.timestamp) : null;

    return (
        <>
            <div
                className="rounded-2xl p-4"
                style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-subtle)" }}>
                            {ta ? "உயிர் அறிகுறிகள்" : "Vital Signs"}
                        </div>
                        <div className="text-[13px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {lastTime
                                ? (ta ? `கடைசியாக ${lastTime}` : `Last recorded ${lastTime}`)
                                : (ta ? "இன்னும் பதிவு இல்லை" : "No reading today")}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 font-tamil"
                        style={{ background: "var(--kw-brand)", color: "white" }}
                    >
                        {ta ? "பதிவு" : "Log now"}
                    </button>
                </div>

                {/* 2 × 3 vitals grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 sm:gap-2">
                    {VITALS_CONFIG.map((cfg) => {
                        const rawVal = latest?.[cfg.key] ?? null;
                        const status = getVitalStatus(cfg, rawVal);
                        const statusMeta = STATUS_COLORS[status];
                        const trend = vitals.length > 1 ? getTrend(vitals, cfg.key, cfg.isBP) : null;
                        const display = fmtValue(cfg, rawVal);
                        const hasValue = display !== "—";

                        return (
                            <div
                                key={cfg.key}
                                className="rounded-xl px-2.5 py-2.5"
                                style={{
                                    background: hasValue && status === "abnormal"
                                        ? "var(--kw-er-tint)"
                                        : hasValue && status === "borderline"
                                        ? "#fef3c7"
                                        : "var(--kw-bg-deep)",
                                    border: `1px solid ${hasValue && status !== "normal" && status !== "none" ? (status === "abnormal" ? "var(--kw-er)44" : "#f59e0b44") : "var(--kw-line)"}`,
                                }}
                            >
                                {/* Label row */}
                                <div className="flex items-center gap-1 mb-1.5">
                                    <span
                                        className="text-[9px] font-bold uppercase tracking-wider font-tamil leading-none"
                                        style={{ color: hasValue ? cfg.color : "var(--kw-subtle)" }}
                                    >
                                        {ta ? cfg.labelTa : cfg.labelEn}
                                    </span>
                                </div>

                                {/* Value */}
                                <div
                                    className="font-display font-bold tabular-nums leading-none"
                                    style={{
                                        fontSize: display.length > 5 ? "0.9rem" : "1.15rem",
                                        color: hasValue ? (status === "abnormal" ? "var(--kw-er)" : status === "borderline" ? "#b45309" : cfg.color) : "var(--kw-subtle)",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {display}
                                </div>

                                {/* Unit + trend */}
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[9px]" style={{ color: "var(--kw-subtle)" }}>{cfg.unit}</span>
                                    <div className="flex items-center gap-0.5">
                                        {hasValue && (
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta.dot }} />
                                        )}
                                        {trend === "up"   && <KwIcon name="trendUp"   size={10} strokeWidth={2.5} style={{ color: cfg.color }} />}
                                        {trend === "down" && <KwIcon name="trendDown" size={10} strokeWidth={2.5} style={{ color: cfg.color }} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Abnormal alert row */}
                {latest && (() => {
                    const abnormals = VITALS_CONFIG.filter(cfg => {
                        const raw = latest[cfg.key] ?? null;
                        return getVitalStatus(cfg, raw) === "abnormal";
                    });
                    if (abnormals.length === 0) return null;
                    return (
                        <div
                            className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold font-tamil"
                            style={{ background: "var(--kw-er-tint)", color: "var(--kw-er-deep)", border: "1px solid var(--kw-er)33" }}
                        >
                            <KwIcon name="alert" size={13} strokeWidth={2.5} />
                            {ta
                                ? `⚠ அசாதாரண மதிப்பு: ${abnormals.map(c => c.labelTa).join(", ")}`
                                : `⚠ Abnormal: ${abnormals.map(c => c.labelEn).join(", ")} — notify care team`}
                        </div>
                    );
                })()}
            </div>

            {showModal && (
                <VitalsEntryModal
                    language={language}
                    latestReading={latest}
                    onSave={onLog}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
