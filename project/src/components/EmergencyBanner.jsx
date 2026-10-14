import { useEffect, useRef, useState } from "react";
import KwIcon from "./icons/KwIcon";

export default function EmergencyBanner({
    language,
    holdMs = 800,
    requireHold = false,
    onActivate,
}) {
    const [progress, setProgress] = useState(0);
    const startRef = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    const start = () => {
        if (!requireHold) {
            onActivate?.();
            return;
        }
        startRef.current = performance.now();
        const tick = () => {
            const elapsed = performance.now() - startRef.current;
            const p = Math.min(1, elapsed / holdMs);
            setProgress(p);
            if (p >= 1) {
                setProgress(0);
                onActivate?.();
                return;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
        cancelAnimationFrame(rafRef.current);
        setProgress(0);
    };

    const labelTitle = language === "ta" ? "உடனடி உதவி அழைக்கவும்" : "Call for emergency help";
    const labelDesc = requireHold
        ? language === "ta"
            ? "திறமையான செவிலியர் + தளப்பணியாளர்களை எச்சரிக்கிறது. உறுதி செய்ய பிடித்துக் கொள்ளுங்கள்."
            : "Alerts the on-call nurse + on-floor team. Hold to confirm."
        : language === "ta"
            ? "திறமையான செவிலியர் + தளப்பணியாளர்களை எச்சரிக்கிறது."
            : "Alerts the on-call nurse + on-floor team.";

    return (
        <button
            onMouseDown={start}
            onMouseUp={stop}
            onMouseLeave={stop}
            onTouchStart={start}
            onTouchEnd={stop}
            onClick={() => { if (!requireHold) onActivate?.(); }}
            className="relative w-full text-left rounded-3xl overflow-hidden transition-shadow"
            style={{
                background: "var(--kw-er)",
                color: "white",
                boxShadow: "var(--kw-shadow-er)",
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
            }}
            aria-label={labelTitle}
        >
            {/* Hold-progress overlay */}
            <div
                className="absolute inset-y-0 left-0 transition-[width] pointer-events-none"
                style={{
                    width: `${progress * 100}%`,
                    background: "oklch(1 0 0 / 0.18)",
                }}
            />

            <div
                className="rounded-2xl flex items-center justify-center shrink-0"
                style={{
                    width: 56,
                    height: 56,
                    background: "oklch(1 0 0 / 0.16)",
                    boxShadow: "inset 0 1px 0 0 oklch(1 0 0 / 0.25)",
                }}
            >
                <KwIcon name="catEmergency" size={28} strokeWidth={2.2} />
            </div>

            <div className="flex-1 min-w-0 relative">
                <div className="font-display font-extrabold text-balance leading-tight" style={{ fontSize: "1.375rem", letterSpacing: "-0.018em" }}>
                    {labelTitle}
                </div>
                <div className="text-[13px] mt-1 opacity-90 font-tamil">
                    {labelDesc}
                </div>
            </div>

            <span className="shrink-0 hidden sm:flex items-center" style={{ opacity: 0.85 }}>
                <KwIcon name="chevronRight" size={18} strokeWidth={2.2} />
            </span>
        </button>
    );
}
