import { useState } from "react";
import KwIcon from "./icons/KwIcon";

export default function EmergencyRail({ language, onActivate, onCallNurse, headerOffset = 64 }) {
    const [holding, setHolding] = useState(false);

    return (
        <aside
            className="hidden lg:flex flex-col fixed right-0 z-30"
            style={{
                top: headerOffset,
                bottom: 0,
                width: 112,
                borderLeft: "1px solid var(--kw-line)",
                background: "var(--kw-bg)",
                padding: "20px 14px",
            }}
            aria-label={language === "ta" ? "அவசர பலகம்" : "Emergency rail"}
        >
            <div
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-center mb-3"
                style={{ color: "var(--kw-muted)" }}
            >
                {language === "ta" ? "அவசரம்" : "Emergency"}
            </div>

            <button
                onClick={onActivate}
                onMouseDown={() => setHolding(true)}
                onMouseUp={() => setHolding(false)}
                onMouseLeave={() => setHolding(false)}
                onTouchStart={() => setHolding(true)}
                onTouchEnd={() => setHolding(false)}
                className="flex-1 w-full rounded-3xl flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden"
                style={{
                    background: holding
                        ? "var(--kw-er-deep)"
                        : "var(--kw-er)",
                    color: "white",
                    boxShadow: holding
                        ? "var(--kw-shadow-er), inset 0 0 0 4px oklch(0 0 0 / 0.1)"
                        : "var(--kw-shadow-er), inset 0 1px 0 0 oklch(1 0 0 / 0.15)",
                    transform: holding ? "scale(0.98)" : undefined,
                    minHeight: 220,
                }}
                aria-label={language === "ta" ? "உடனடி உதவி அழைக்க" : "Call for emergency help"}
            >
                {/* Subtle decorative pulse rings */}
                <span
                    className="absolute inset-4 rounded-2xl pointer-events-none animate-pulse-ring"
                    style={{ "--ring-color": "oklch(1 0 0 / 0.18)" }}
                />

                <div
                    className="rounded-2xl flex items-center justify-center"
                    style={{
                        width: 64,
                        height: 64,
                        background: "oklch(1 0 0 / 0.16)",
                        boxShadow: "inset 0 1px 0 0 oklch(1 0 0 / 0.25)",
                    }}
                >
                    <KwIcon name="siren" size={32} strokeWidth={2} />
                </div>

                <div className="font-display font-extrabold text-[15px] leading-tight text-center px-2">
                    {language === "ta" ? "உதவி" : "Help"}
                    <div className="font-medium opacity-90 text-[11px] mt-1 tracking-wider uppercase">
                        {language === "ta" ? "அழைக்க" : "Tap now"}
                    </div>
                </div>
            </button>

            <button
                onClick={onCallNurse}
                className="mt-3 w-full rounded-2xl flex flex-col items-center justify-center gap-1.5 py-3 transition-colors"
                style={{
                    background: "var(--kw-surface)",
                    color: "var(--kw-ink)",
                    border: "1px solid var(--kw-line)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--kw-line-strong)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--kw-line)")}
            >
                <KwIcon name="phone" size={20} strokeWidth={1.8} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--kw-muted)" }}>
                    {language === "ta" ? "செவிலியர்" : "Nurse"}
                </span>
            </button>
        </aside>
    );
}
