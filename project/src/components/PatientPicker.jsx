import { useEffect, useRef, useState } from "react";
import KwIcon from "./icons/KwIcon";

function initials(name) {
    if (!name) return "?";
    return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function PatientPicker({
    patients,
    activePatientId,
    onSelect,
    onManage,
    onAddNew,
    onEditActive,
    language,
}) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const ref = useRef(null);
    const active = patients.find((p) => p.id === activePatientId);

    useEffect(() => {
        if (!open) return undefined;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl transition-all"
                style={{
                    background: "var(--kw-surface)",
                    border: `1px solid ${open || hovered ? "var(--kw-brand)" : "var(--kw-line)"}`,
                    boxShadow: hovered ? "0 4px 12px -4px oklch(0.55 0.08 175 / 0.25)" : undefined,
                }}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <Avatar name={active?.firstName || active?.name} accent={active?.accentColor} />
                <div className="text-left leading-tight hidden sm:block">
                    <div
                        className="font-display font-semibold text-[13px] truncate max-w-[160px]"
                        style={{ color: "var(--kw-ink)" }}
                    >
                        {active?.name || "—"}
                    </div>
                    <div className="text-[10.5px] mt-0.5 truncate max-w-[160px]" style={{ color: "var(--kw-muted)" }}>
                        {active?.room ? `Room ${active.room}` : ""}
                        {active?.room && active?.mrn ? " · " : ""}
                        {active?.mrn ? `MRN ${active.mrn}` : ""}
                    </div>
                </div>
                <KwIcon name="chevronDown" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-[340px] rounded-2xl overflow-hidden animate-pop"
                    style={{
                        background: "var(--kw-surface)",
                        border: "1px solid var(--kw-line)",
                        boxShadow: "var(--kw-shadow-xl)",
                        zIndex: 60,
                    }}
                    role="listbox"
                >
                    {/* Header with title + quick add */}
                    <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid var(--kw-line)" }}>
                        <div
                            className="text-[10px] font-bold uppercase tracking-[0.14em]"
                            style={{ color: "var(--kw-subtle)" }}
                        >
                            {language === "ta" ? "நோயாளர்கள்" : "Patients"} · {patients.length}
                        </div>
                        <button
                            onClick={() => { onAddNew?.(); setOpen(false); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                            style={{
                                background: "var(--kw-brand)",
                                color: "white",
                            }}
                        >
                            <KwIcon name="plus" size={12} strokeWidth={2.4} />
                            {language === "ta" ? "புதிய நோயாளர்" : "New patient"}
                        </button>
                    </div>

                    {/* Patient list */}
                    <div className="max-h-[280px] overflow-y-auto p-2">
                        {patients.map((p) => (
                            <PatientRow
                                key={p.id}
                                patient={p}
                                isActive={p.id === activePatientId}
                                onSelect={() => { onSelect(p.id); setOpen(false); }}
                                onEdit={() => { onEditActive?.(p); setOpen(false); }}
                                language={language}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t" style={{ borderColor: "var(--kw-line)" }}>
                        <button
                            onClick={() => { onManage(); setOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 transition-colors"
                            style={{ color: "var(--kw-muted)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--kw-bg-deep)"; e.currentTarget.style.color = "var(--kw-ink)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--kw-muted)"; }}
                        >
                            <KwIcon name="settings" size={14} />
                            <span className="font-semibold text-[12px] font-tamil">
                                {language === "ta" ? "அனைத்தையும் நிர்வகி" : "Manage all patients"}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function PatientRow({ patient, isActive, onSelect, onEdit, language }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className="flex items-center gap-2 rounded-lg transition-colors"
            style={{
                background: isActive ? "var(--kw-brand-tint)" : hovered ? "var(--kw-bg-deep)" : "transparent",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                onClick={onSelect}
                className="flex-1 flex items-center gap-3 px-2 py-2 rounded-lg text-left min-w-0"
            >
                <Avatar name={patient.firstName || patient.name} accent={patient.accentColor} size={36} />
                <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-sm truncate" style={{ color: "var(--kw-ink)" }}>
                        {patient.name}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: "var(--kw-muted)" }}>
                        {patient.room ? `Room ${patient.room}` : ""}{patient.room && patient.mrn ? " · " : ""}{patient.mrn ? `MRN ${patient.mrn}` : ""}
                    </div>
                </div>
                {isActive && (
                    <span style={{ color: "var(--kw-brand)" }} className="shrink-0 mr-1">
                        <KwIcon name="check" size={16} />
                    </span>
                )}
            </button>
            <button
                onClick={onEdit}
                className="w-8 h-8 mr-2 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{
                    background: hovered || isActive ? "var(--kw-surface)" : "transparent",
                    border: `1px solid ${hovered || isActive ? "var(--kw-line)" : "transparent"}`,
                    color: "var(--kw-muted)",
                    opacity: hovered || isActive ? 1 : 0,
                }}
                title={language === "ta" ? "தொகு" : "Edit"}
                aria-label={language === "ta" ? "தொகு" : "Edit"}
            >
                <KwIcon name="edit" size={13} />
            </button>
        </div>
    );
}

export function Avatar({ name, accent = "#3a8e88", size = 30 }) {
    return (
        <div
            className="rounded-xl flex items-center justify-center font-display font-bold shrink-0"
            style={{
                width: size,
                height: size,
                background: `${accent}1f`,
                color: accent,
                fontSize: size * 0.42,
                boxShadow: `inset 0 0 0 1px ${accent}26`,
            }}
            aria-hidden="true"
        >
            {initials(name)}
        </div>
    );
}
