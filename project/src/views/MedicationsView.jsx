import { useState } from "react";
import KwIcon from "../components/icons/KwIcon";

/* ── Constants ── */
const MED_COLORS = ["#3b82f6","#22c55e","#f97316","#a855f7","#ec4899","#14b8a6","#f59e0b","#ef4444","#6366f1","#84cc16"];

const FORMS = [
    { value: "tablet",   labelEn: "Tablet",    labelTa: "மாத்திரை" },
    { value: "capsule",  labelEn: "Capsule",   labelTa: "காப்சூல்" },
    { value: "liquid",   labelEn: "Liquid / Syrup", labelTa: "திரவம்" },
    { value: "injection",labelEn: "Injection", labelTa: "ஊசி" },
    { value: "inhaler",  labelEn: "Inhaler",   labelTa: "இன்ஹேலர்" },
    { value: "patch",    labelEn: "Patch",     labelTa: "பேட்ச்" },
    { value: "drops",    labelEn: "Drops",     labelTa: "சொட்டுகள்" },
    { value: "other",    labelEn: "Other",     labelTa: "மற்றவை" },
];

const TIMINGS = [
    { value: "morning",   labelEn: "Morning",   labelTa: "காலை",      time: "08:00" },
    { value: "afternoon", labelEn: "Afternoon", labelTa: "மதியம்",    time: "13:00" },
    { value: "evening",   labelEn: "Evening",   labelTa: "மாலை",      time: "18:00" },
    { value: "night",     labelEn: "Night",     labelTa: "இரவு",      time: "22:00" },
    { value: "as_needed", labelEn: "As Needed", labelTa: "தேவைப்படும்", time: null },
];

const FREQUENCIES = [
    { value: "once_daily",  labelEn: "Once daily",         labelTa: "நாளொரு முறை" },
    { value: "twice_daily", labelEn: "Twice daily",        labelTa: "இரண்டு முறை / நாள்" },
    { value: "thrice_daily",labelEn: "Three times daily",  labelTa: "மூன்று முறை / நாள்" },
    { value: "four_daily",  labelEn: "Four times daily",   labelTa: "நான்கு முறை / நாள்" },
    { value: "weekly",      labelEn: "Once weekly",        labelTa: "வாரம் ஒரு முறை" },
    { value: "as_needed",   labelEn: "As needed (PRN)",    labelTa: "தேவைப்படும்போது" },
    { value: "alternate",   labelEn: "Alternate days",     labelTa: "ஒரு நாள் விட்டு" },
];

const EMPTY_FORM = {
    name: "", genericName: "", form: "tablet", dosage: "", frequency: "once_daily",
    timings: ["morning"], withFood: true, instructions: "", startDate: "", endDate: "",
    prescribedBy: "", color: MED_COLORS[0], active: true,
};

/* ── Form field wrapper ── */
function Field({ label, required, children }) {
    return (
        <div>
            <label className="text-xs font-semibold mb-1.5 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                {label}{required && <span style={{ color: "var(--kw-er)" }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function InputStyle({ hasError } = {}) {
    return {
        width: "100%", background: "var(--kw-bg-deep)",
        border: `1px solid ${hasError ? "var(--kw-er)" : "var(--kw-line)"}`,
        color: "var(--kw-ink)", borderRadius: "10px", padding: "8px 12px",
        fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
    };
}

/* ── Medication form (add / edit) ── */
function MedForm({ existing, onSave, onClose, language, allMeds }) {
    const ta = language === "ta";
    const colorIdx = existing ? MED_COLORS.indexOf(existing.color) : allMeds.length % MED_COLORS.length;
    const [form, setForm] = useState(existing ? { ...EMPTY_FORM, ...existing } : { ...EMPTY_FORM, color: MED_COLORS[colorIdx] });
    const [errors, setErrors] = useState({});

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleTiming = (t) => setForm(f => ({
        ...f,
        timings: f.timings.includes(t) ? f.timings.filter(x => x !== t) : [...f.timings, t],
    }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = true;
        if (!form.dosage.trim()) e.dosage = true;
        if (form.timings.length === 0) e.timings = true;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => { if (validate()) onSave(form); };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.55)", backdropFilter: "blur(8px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
                style={{ background: "var(--kw-surface)", boxShadow: "var(--kw-shadow-xl)", maxHeight: "92vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <div>
                        <h3 className="font-display font-bold font-tamil" style={{ fontSize: "1.1rem", color: "var(--kw-ink)" }}>
                            {existing ? (ta ? "மருந்தை திருத்து" : "Edit Medication") : (ta ? "புதிய மருந்து சேர்" : "Add Medication")}
                        </h3>
                        <p className="text-xs font-tamil mt-0.5" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "எல்லா விவரங்களையும் பூர்த்தி செய்யவும்" : "Fill in all required details for safe administration"}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-muted)" }}>
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                    {/* Identification */}
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label={ta ? "மருந்து பெயர் *" : "Medication name *"} required>
                            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder={ta ? "எ.கா. Metformin" : "e.g. Metformin"} style={InputStyle({ hasError: errors.name })} />
                        </Field>
                        <Field label={ta ? "பொது பெயர்" : "Generic / brand name"}>
                            <input value={form.genericName} onChange={e => set("genericName", e.target.value)} placeholder={ta ? "தேர்வு செய்ய வேண்டிய பெயர்" : "Optional"} style={InputStyle()} />
                        </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label={ta ? "வடிவம்" : "Form"}>
                            <select value={form.form} onChange={e => set("form", e.target.value)} style={InputStyle()}>
                                {FORMS.map(f => <option key={f.value} value={f.value}>{ta ? f.labelTa : f.labelEn}</option>)}
                            </select>
                        </Field>
                        <Field label={ta ? "அளவு *" : "Dosage *"} required>
                            <input value={form.dosage} onChange={e => set("dosage", e.target.value)} placeholder={ta ? "எ.கா. 500mg, 2 மாத்திரை" : "e.g. 500 mg, 2 tablets"} style={InputStyle({ hasError: errors.dosage })} />
                        </Field>
                    </div>

                    <Field label={ta ? "அதிர்வு" : "Frequency"}>
                        <select value={form.frequency} onChange={e => set("frequency", e.target.value)} style={InputStyle()}>
                            {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{ta ? f.labelTa : f.labelEn}</option>)}
                        </select>
                    </Field>

                    {/* Timings */}
                    <Field label={ta ? `${ta ? "நேரம்" : "Timing"} *` : "Timing *"} required>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {TIMINGS.map(t => {
                                const on = form.timings.includes(t.value);
                                return (
                                    <button key={t.value} type="button" onClick={() => toggleTiming(t.value)}
                                        className="px-3 py-1.5 rounded-xl text-sm font-semibold font-tamil transition-all"
                                        style={{
                                            background: on ? "var(--kw-brand)" : "var(--kw-bg-deep)",
                                            color: on ? "white" : "var(--kw-ink)",
                                            border: `1px solid ${on ? "var(--kw-brand)" : errors.timings ? "var(--kw-er)" : "var(--kw-line)"}`,
                                        }}
                                    >
                                        {ta ? t.labelTa : t.labelEn}
                                        {t.time && <span className="ml-1 opacity-70 text-[10px]">{t.time}</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.timings && <p className="text-xs mt-1" style={{ color: "var(--kw-er)" }}>{ta ? "குறைந்தது ஒரு நேரம் தேர்வு செய்யவும்" : "Select at least one timing."}</p>}
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label={ta ? "தொடக்க தேதி" : "Start date"}>
                            <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} style={InputStyle()} />
                        </Field>
                        <Field label={ta ? "முடிவு தேதி" : "End date (optional)"}>
                            <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} style={InputStyle()} />
                        </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label={ta ? "மருத்துவர்" : "Prescribed by"}>
                            <input value={form.prescribedBy} onChange={e => set("prescribedBy", e.target.value)} placeholder="Dr. Name" style={InputStyle()} />
                        </Field>
                        <div>
                            <label className="text-xs font-semibold mb-1.5 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                                {ta ? "உணவுடன்" : "With food?"}
                            </label>
                            <div className="flex gap-2 mt-0.5">
                                {[true, false].map(v => (
                                    <button key={String(v)} type="button" onClick={() => set("withFood", v)}
                                        className="flex-1 py-2 rounded-xl text-sm font-semibold font-tamil transition-all"
                                        style={{
                                            background: form.withFood === v ? "var(--kw-brand-tint)" : "var(--kw-bg-deep)",
                                            border: `1px solid ${form.withFood === v ? "var(--kw-brand)" : "var(--kw-line)"}`,
                                            color: form.withFood === v ? "var(--kw-brand-ink)" : "var(--kw-ink)",
                                        }}
                                    >
                                        {v ? (ta ? "ஆம்" : "Yes") : (ta ? "இல்லை" : "No")}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Field label={ta ? "சிறப்பு வழிமுறைகள்" : "Special instructions"}>
                        <textarea value={form.instructions} onChange={e => set("instructions", e.target.value)} rows={2}
                            placeholder={ta ? "எ.கா. வெதுவெதுப்பான தண்ணீருடன் எடு" : "e.g. Take with a full glass of water, avoid grapefruit"}
                            style={{ ...InputStyle(), resize: "vertical" }} />
                    </Field>

                    {/* Colour picker */}
                    <div>
                        <label className="text-xs font-semibold mb-2 block font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {ta ? "அடையாள வண்ணம்" : "Identification colour"}
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {MED_COLORS.map(c => (
                                <button key={c} type="button" onClick={() => set("color", c)}
                                    className="w-7 h-7 rounded-full transition-all"
                                    style={{
                                        background: c,
                                        boxShadow: form.color === c ? `0 0 0 2px var(--kw-surface), 0 0 0 4px ${c}` : "none",
                                        transform: form.color === c ? "scale(1.15)" : "none",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border font-tamil" style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)", background: "var(--kw-surface)" }}>
                        {ta ? "ரத்து" : "Cancel"}
                    </button>
                    <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white font-tamil" style={{ background: "var(--kw-brand)" }}>
                        {existing ? (ta ? "புதுப்பி" : "Update") : (ta ? "சேர்" : "Add Medication")}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Medication card ── */
function MedCard({ med, onEdit, onToggleActive, onDelete, language }) {
    const ta = language === "ta";
    const formMeta = FORMS.find(f => f.value === med.form) || FORMS[0];
    const timingsLabel = (med.timings || []).map(t => {
        const meta = TIMINGS.find(x => x.value === t);
        return meta ? (ta ? meta.labelTa : meta.labelEn) : t;
    }).join(", ");

    return (
        <div
            className="rounded-2xl p-4 transition-all"
            style={{
                background: "var(--kw-surface)",
                border: `1px solid ${med.active === false ? "var(--kw-line)" : `${med.color}44`}`,
                opacity: med.active === false ? 0.6 : 1,
            }}
        >
            <div className="flex items-start gap-3">
                {/* Colour dot */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${med.color}18`, color: med.color }}>
                    <KwIcon name="pill" size={20} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-bold text-base font-tamil" style={{ color: "var(--kw-ink)" }}>{med.name}</h4>
                        {med.genericName && <span className="text-xs font-tamil" style={{ color: "var(--kw-muted)" }}>({med.genericName})</span>}
                        {med.active === false && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--kw-line)", color: "var(--kw-muted)" }}>
                                {ta ? "நிறுத்தப்பட்டது" : "Discontinued"}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full font-tamil" style={{ background: `${med.color}18`, color: med.color }}>
                            {med.dosage} · {ta ? formMeta.labelTa : formMeta.labelEn}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-tamil" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-ink)", border: "1px solid var(--kw-line)" }}>
                            🕐 {timingsLabel}
                        </span>
                        {med.withFood && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-tamil" style={{ background: "var(--kw-brand-tint)", color: "var(--kw-brand-ink)" }}>
                                🍽 {ta ? "உணவுடன்" : "With food"}
                            </span>
                        )}
                    </div>
                    {med.instructions && (
                        <p className="text-xs mt-1.5 font-tamil" style={{ color: "var(--kw-ink-soft)" }}>
                            ℹ️ {med.instructions}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1 text-[11px]" style={{ color: "var(--kw-muted)" }}>
                        {med.prescribedBy && <span>Rx: {med.prescribedBy}</span>}
                        {med.startDate && <span>{ta ? "தொடக்கம்" : "From"}: {new Date(med.startDate + "T00:00").toLocaleDateString()}</span>}
                        {med.endDate   && <span>{ta ? "முடிவு" : "Until"}: {new Date(med.endDate + "T00:00").toLocaleDateString()}</span>}
                    </div>
                </div>
            </div>
            {/* Actions */}
            <div className="flex gap-1.5 mt-3">
                <button onClick={onEdit} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border font-tamil transition-all hover:opacity-80" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)", color: "var(--kw-ink)" }}>
                    <KwIcon name="edit" size={12} strokeWidth={2} className="inline mr-1" />{ta ? "திருத்து" : "Edit"}
                </button>
                <button onClick={onToggleActive} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border font-tamil transition-all hover:opacity-80"
                    style={{
                        background: med.active === false ? "var(--kw-brand-tint)" : "var(--kw-er-tint)",
                        border: `1px solid ${med.active === false ? "var(--kw-brand)44" : "var(--kw-er)44"}`,
                        color: med.active === false ? "var(--kw-brand-ink)" : "var(--kw-er-deep)",
                    }}
                >
                    {med.active === false ? (ta ? "மீண்டும் செயல்படுத்து" : "Reactivate") : (ta ? "நிறுத்து" : "Discontinue")}
                </button>
                <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80" style={{ background: "var(--kw-er-tint)", color: "var(--kw-er)", border: "1px solid var(--kw-er)44" }}>
                    <KwIcon name="trash" size={13} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}

/* ── Today's schedule preview ── */
function TodaySchedule({ medications, language }) {
    const ta = language === "ta";
    const active = medications.filter(m => m.active !== false);
    if (active.length === 0) return null;

    const schedule = {};
    for (const med of active) {
        for (const t of (med.timings || [])) {
            if (!schedule[t]) schedule[t] = [];
            schedule[t].push(med);
        }
    }

    return (
        <div className="rounded-3xl p-5" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: "var(--kw-brand)" }}>
                {ta ? "இன்றைய மருந்து அட்டவணை" : "Today's Medication Schedule"}
            </div>
            <div className="space-y-3">
                {TIMINGS.map(({ value, labelEn, labelTa, time }) => {
                    const meds = schedule[value];
                    if (!meds?.length) return null;
                    return (
                        <div key={value} className="rounded-2xl p-3" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--kw-muted)" }}>{ta ? labelTa : labelEn}</span>
                                {time && <span className="text-[10px]" style={{ color: "var(--kw-subtle)" }}>{time}</span>}
                                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--kw-brand-tint)", color: "var(--kw-brand-ink)" }}>
                                    {meds.length} {ta ? "மருந்து" : "med" + (meds.length > 1 ? "s" : "")}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {meds.map(m => (
                                    <span key={m.id} className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-xs font-semibold font-tamil" style={{ background: `${m.color}18`, border: `1px solid ${m.color}44`, color: "var(--kw-ink)" }}>
                                        <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                                        {m.name} · {m.dosage}
                                        {m.withFood && <span className="opacity-60">🍽</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Main view ── */
export default function MedicationsView({ medications = [], onAdd, onUpdate, onDelete, language, patient }) {
    const [showForm, setShowForm] = useState(false);
    const [editingMed, setEditingMed] = useState(null);
    const [filter, setFilter] = useState("active"); // "active" | "all" | "discontinued"

    const ta = language === "ta";
    const firstName = patient?.firstName || patient?.name?.split(" ")[0] || "";

    const filtered = medications.filter(m => {
        if (filter === "active")       return m.active !== false;
        if (filter === "discontinued") return m.active === false;
        return true;
    });

    const handleSave = (form) => {
        if (editingMed) {
            onUpdate({ ...form, id: editingMed.id });
        } else {
            onAdd({ ...form, id: Date.now().toString() });
        }
        setShowForm(false);
        setEditingMed(null);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: "var(--kw-brand)" }}>
                        {ta ? "மருந்து மேலாண்மை" : "Medication Management"}
                    </div>
                    <h1 className="font-display font-semibold font-tamil" style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", color: "var(--kw-ink)", letterSpacing: "-0.025em" }}>
                        {ta ? `${firstName} · மருந்துகள்` : `${firstName} · Medications`}
                    </h1>
                    <p className="text-sm font-tamil mt-1" style={{ color: "var(--kw-muted)" }}>
                        {ta ? "மருத்துவர் பரிந்துரைத்த மருந்துகளை நிர்வகிக்கவும்." : "Manage prescribed medications, dosages, and administration schedules."}
                    </p>
                </div>
                <button
                    onClick={() => { setEditingMed(null); setShowForm(true); }}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 font-tamil"
                    style={{ background: "var(--kw-brand)" }}
                >
                    <KwIcon name="plus" size={16} strokeWidth={2.5} />
                    {ta ? "மருந்து சேர்" : "Add Medication"}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
                {/* ── Medication list ── */}
                <div>
                    {/* Filter tabs */}
                    <div className="flex gap-1 mb-4 p-1 rounded-2xl w-fit" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}>
                        {[
                            { id: "active",       labelEn: "Active",        labelTa: "செயலில்" },
                            { id: "discontinued", labelEn: "Discontinued",  labelTa: "நிறுத்தப்பட்டது" },
                            { id: "all",          labelEn: "All",           labelTa: "எல்லாம்" },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setFilter(tab.id)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold font-tamil transition-all"
                                style={{
                                    background: filter === tab.id ? "var(--kw-surface)" : "transparent",
                                    color: filter === tab.id ? "var(--kw-ink)" : "var(--kw-muted)",
                                    boxShadow: filter === tab.id ? "var(--kw-shadow-sm)" : "none",
                                }}
                            >
                                {ta ? tab.labelTa : tab.labelEn}
                                <span className="ml-1.5 px-1 py-0.5 rounded text-[10px]" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-muted)" }}>
                                    {medications.filter(m => tab.id === "active" ? m.active !== false : tab.id === "discontinued" ? m.active === false : true).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="rounded-3xl py-16 text-center" style={{ background: "var(--kw-surface)", border: "1.5px dashed var(--kw-line-strong)" }}>
                            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-subtle)" }}>
                                <KwIcon name="pill" size={28} strokeWidth={1.5} />
                            </div>
                            <p className="font-display font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>
                                {ta ? "மருந்துகள் ஏதும் இல்லை" : "No medications yet"}
                            </p>
                            <p className="text-sm mt-1 font-tamil" style={{ color: "var(--kw-muted)" }}>
                                {ta ? "மேலே '+மருந்து சேர்' பொத்தானை கிளிக் செய்யவும்." : "Click 'Add Medication' above to get started."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(med => (
                                <MedCard
                                    key={med.id} med={med} language={language}
                                    onEdit={() => { setEditingMed(med); setShowForm(true); }}
                                    onToggleActive={() => onUpdate({ ...med, active: med.active === false ? true : false })}
                                    onDelete={() => onDelete(med.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Today's schedule sidebar ── */}
                <div className="space-y-4">
                    <TodaySchedule medications={medications} language={language} />

                    {/* Stats card */}
                    <div className="rounded-3xl p-5" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)" }}>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "var(--kw-brand)" }}>
                            {ta ? "சுருக்கம்" : "Summary"}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: ta ? "செயலில்"      : "Active",        value: medications.filter(m => m.active !== false).length,  color: "var(--kw-brand)" },
                                { label: ta ? "நிறுத்தப்பட்டது" : "Discontinued", value: medications.filter(m => m.active === false).length,   color: "var(--kw-muted)" },
                                { label: ta ? "உணவுடன்"     : "With food",     value: medications.filter(m => m.active !== false && m.withFood).length, color: "var(--kw-social)" },
                                { label: ta ? "தேவைப்படும்" : "PRN",           value: medications.filter(m => m.active !== false && m.timings?.includes("as_needed")).length, color: "var(--kw-comfort)" },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}>
                                    <div className="font-display font-bold tabular-nums text-xl leading-none" style={{ color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                                    <div className="text-[10px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit form modal */}
            {showForm && (
                <MedForm
                    existing={editingMed}
                    allMeds={medications}
                    language={language}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditingMed(null); }}
                />
            )}
        </>
    );
}
