import { useEffect, useState } from "react";
import KwIcon from "./icons/KwIcon";
import { Avatar } from "./PatientPicker";

const ACCENT_PRESETS = ["#3a8e88", "#5a7da3", "#a25249", "#7170a8", "#a78346", "#7c8b7e"];

export default function PatientManager({
    open,
    patients,
    activePatientId,
    initialMode, // null | "new" | patient object → opens directly into that form
    onClose,
    onCreate,
    onUpdate,
    onDelete,
    onSelect,
    language,
}) {
    const [editing, setEditing] = useState(null); // patient or "new" or null

    // Sync internal editing state with external initial mode whenever the modal opens
    useEffect(() => {
        if (open) setEditing(initialMode || null);
        else setEditing(null);
    }, [open, initialMode]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade"
            style={{ background: "oklch(0.20 0.01 60 / 0.55)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-hidden animate-pop flex flex-col"
                style={{ boxShadow: "var(--kw-shadow-xl)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--kw-line)" }}>
                    <div>
                        <h2 className="font-display font-bold text-xl" style={{ color: "var(--kw-ink)", letterSpacing: "-0.022em" }}>
                            {language === "ta" ? "நோயாளர்களை நிர்வகி" : "Manage patients"}
                        </h2>
                        <p className="text-sm mt-1" style={{ color: "var(--kw-muted)" }}>
                            {language === "ta"
                                ? "ஒவ்வொரு நோயாளருக்கும் தனித்துவமான செயல் தொகுப்பு உள்ளது."
                                : "Each patient has their own action set, voice, and history."}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                        style={{ color: "var(--kw-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--kw-bg-deep)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        aria-label="Close"
                    >
                        <KwIcon name="close" size={18} />
                    </button>
                </div>

                {!editing && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                        {patients.map((p) => (
                            <PatientRow
                                key={p.id}
                                patient={p}
                                isActive={p.id === activePatientId}
                                onSelect={() => onSelect(p.id)}
                                onEdit={() => setEditing(p)}
                                onDelete={() => onDelete(p.id)}
                                language={language}
                                disableDelete={patients.length <= 1}
                            />
                        ))}
                        <button
                            onClick={() => setEditing("new")}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-dashed font-semibold text-sm transition-colors"
                            style={{
                                border: "1.5px dashed var(--kw-line-strong)",
                                color: "var(--kw-brand)",
                                background: "var(--kw-bg-deep)",
                            }}
                        >
                            <KwIcon name="plus2" size={16} />
                            {language === "ta" ? "புதிய நோயாளரை சேர்" : "Add new patient"}
                        </button>
                    </div>
                )}

                {editing && (
                    <PatientForm
                        existing={editing === "new" ? null : editing}
                        language={language}
                        onCancel={() => setEditing(null)}
                        onSave={async (form) => {
                            if (editing === "new") await onCreate(form);
                            else await onUpdate(editing.id, form);
                            setEditing(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function PatientRow({ patient, isActive, onSelect, onEdit, onDelete, language, disableDelete }) {
    const [confirmDel, setConfirmDel] = useState(false);

    return (
        <div
            className="flex items-center gap-3 p-3 rounded-2xl transition-colors"
            style={{
                background: isActive ? "var(--kw-brand-tint)" : "var(--kw-surface)",
                border: `1px solid ${isActive ? "var(--kw-brand)" : "var(--kw-line)"}`,
            }}
        >
            <Avatar name={patient.firstName || patient.name} accent={patient.accentColor} size={44} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className="font-display font-semibold" style={{ color: "var(--kw-ink)" }}>
                        {patient.name}
                    </div>
                    {isActive && (
                        <span
                            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                            style={{ background: "var(--kw-brand)", color: "white" }}
                        >
                            {language === "ta" ? "செயலில்" : "Active"}
                        </span>
                    )}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: "var(--kw-muted)" }}>
                    {patient.room ? `Room ${patient.room}` : ""}{patient.room && patient.mrn ? " · " : ""}
                    {patient.mrn ? `MRN ${patient.mrn}` : ""}
                    {patient.language ? ` · ${patient.language === "ta" ? "தமிழ்" : "English"}` : ""}
                </div>
            </div>
            <div className="flex gap-1.5">
                {!isActive && (
                    <button
                        onClick={onSelect}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)" }}
                    >
                        {language === "ta" ? "மாற்று" : "Switch"}
                    </button>
                )}
                <button
                    onClick={onEdit}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1"
                    style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)" }}
                >
                    <KwIcon name="edit" size={12} /> {language === "ta" ? "தொகு" : "Edit"}
                </button>
                <button
                    onClick={() => (confirmDel ? onDelete() : setConfirmDel(true))}
                    onBlur={() => setConfirmDel(false)}
                    disabled={disableDelete}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border inline-flex items-center gap-1 transition-colors"
                    style={{
                        borderColor: confirmDel ? "var(--kw-er)" : "var(--kw-line)",
                        color: confirmDel ? "white" : "var(--kw-er)",
                        background: confirmDel ? "var(--kw-er)" : "transparent",
                        opacity: disableDelete ? 0.4 : 1,
                        cursor: disableDelete ? "not-allowed" : "pointer",
                    }}
                    title={disableDelete ? "Cannot delete the last patient" : undefined}
                >
                    <KwIcon name="trash" size={12} />
                    {confirmDel ? (language === "ta" ? "உறுதிப்படுத்து" : "Confirm") : (language === "ta" ? "நீக்கு" : "Delete")}
                </button>
            </div>
        </div>
    );
}

function PatientForm({ existing, onSave, onCancel, language }) {
    const [form, setForm] = useState(
        existing || {
            name: "",
            firstName: "",
            room: "",
            mrn: "",
            language: "en",
            accentColor: "#3a8e88",
        }
    );
    const [saving, setSaving] = useState(false);

    const isValid = form.name.trim().length > 0;

    const submit = async () => {
        if (!isValid || saving) return;
        setSaving(true);
        const cleanName = form.name.trim();
        /* Always derive firstName from the latest name so editing "Marcus" → "John" updates the greeting too */
        const firstName = cleanName.split(/\s+/)[0] || "";
        await onSave({ ...form, name: cleanName, firstName });
        setSaving(false);
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <Field label={language === "ta" ? "முழு பெயர்" : "Full name"} required>
                    <input
                        autoFocus
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Marcus Whitfield"
                        className="kw-input"
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label={language === "ta" ? "அறை" : "Room"}>
                        <input
                            value={form.room}
                            onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                            placeholder="412B"
                            className="kw-input"
                        />
                    </Field>
                    <Field label="MRN">
                        <input
                            value={form.mrn}
                            onChange={(e) => setForm((f) => ({ ...f, mrn: e.target.value }))}
                            placeholder="00482-3119"
                            className="kw-input"
                        />
                    </Field>
                </div>

                <Field label={language === "ta" ? "மொழி" : "Language"}>
                    <div className="flex gap-2">
                        {[
                            { v: "en", labelTa: "English", labelEn: "English" },
                            { v: "ta", labelTa: "தமிழ்", labelEn: "Tamil" },
                        ].map((opt) => (
                            <button
                                key={opt.v}
                                onClick={() => setForm((f) => ({ ...f, language: opt.v }))}
                                className="px-3 py-2 rounded-xl text-sm font-semibold border"
                                style={{
                                    background: form.language === opt.v ? "var(--kw-brand)" : "var(--kw-surface)",
                                    color: form.language === opt.v ? "white" : "var(--kw-ink)",
                                    borderColor: form.language === opt.v ? "var(--kw-brand)" : "var(--kw-line)",
                                }}
                            >
                                {language === "ta" ? opt.labelTa : opt.labelEn}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label={language === "ta" ? "வண்ணம்" : "Accent color"}>
                    <div className="flex gap-2">
                        {ACCENT_PRESETS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setForm((f) => ({ ...f, accentColor: c }))}
                                className="w-9 h-9 rounded-xl"
                                style={{
                                    background: c,
                                    boxShadow: form.accentColor === c
                                        ? `0 0 0 2px white, 0 0 0 4px ${c}`
                                        : "inset 0 0 0 1px rgba(0,0,0,0.08)",
                                }}
                                aria-label={c}
                            />
                        ))}
                    </div>
                </Field>
            </div>
            <div
                className="flex gap-2 px-6 py-4 border-t"
                style={{ borderColor: "var(--kw-line)", background: "var(--kw-bg-deep)" }}
            >
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                    style={{
                        background: "var(--kw-surface)",
                        color: "var(--kw-ink)",
                        borderColor: "var(--kw-line)",
                    }}
                >
                    {language === "ta" ? "ரத்து" : "Cancel"}
                </button>
                <button
                    onClick={submit}
                    disabled={!isValid || saving}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity"
                    style={{
                        background: "var(--kw-brand)",
                        opacity: !isValid || saving ? 0.5 : 1,
                    }}
                >
                    {existing
                        ? (language === "ta" ? "புதுப்பி" : "Save changes")
                        : (language === "ta" ? "சேர்" : "Add patient")}
                </button>
            </div>
        </>
    );
}

function Field({ label, children, required }) {
    return (
        <div>
            <label
                className="text-xs font-semibold mb-1.5 block"
                style={{ color: "var(--kw-ink)" }}
            >
                {label}{required && <span style={{ color: "var(--kw-er)" }}> *</span>}
            </label>
            {children}
        </div>
    );
}
