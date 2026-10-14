import { useEffect, useRef, useState } from "react";
import KwIcon from "./icons/KwIcon";

function withAlpha(hex, alpha) {
    if (!hex || !hex.startsWith("#")) return hex;
    const h = hex.replace("#", "");
    const expanded = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const num = parseInt(expanded, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

export default function ActionBlock({
    action,
    onSelect,
    isScanning,
    nightMode,
    language,
    usageCount = 0,
    isActive = false,
    dwellToSelect = false,
    dwellMs = 1200,
}) {
    const [pressed, setPressed] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [dwellProgress, setDwellProgress] = useState(0);
    const dwellStartRef = useRef(0);
    const rafRef = useRef(null);

    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    /* Reset image error if the URL changes */
    useEffect(() => { setImgError(false); }, [action?.image]);

    const label = language === "ta" ? action.labelTamil : action.labelEnglish;
    const audioText = language === "ta" ? action.audioTextTamil : action.audioTextEnglish;
    const isEmergency = action.category === "emergency";
    const accent = action.color || "#3a8e88";
    const tint = action.tint || withAlpha(accent, 0.10);

    const fire = () => {
        setPressed(true);
        setTimeout(() => setPressed(false), 200);
        onSelect(action);
    };

    const startDwell = () => {
        if (!dwellToSelect) return;
        cancelAnimationFrame(rafRef.current);
        dwellStartRef.current = performance.now();
        const tick = () => {
            const elapsed = performance.now() - dwellStartRef.current;
            const p = Math.min(1, elapsed / dwellMs);
            setDwellProgress(p);
            if (p >= 1) {
                setDwellProgress(0);
                fire();
                return;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    };

    const cancelDwell = () => {
        cancelAnimationFrame(rafRef.current);
        setDwellProgress(0);
    };

    const hasImage = Boolean(action.image) && !imgError;

    return (
        <button
            className={`kw-card group w-full text-left ${isScanning ? "animate-scan-glow" : ""}`}
            style={{
                "--kw-card-tint": withAlpha(accent, 0.04),
                "--ring-color": withAlpha(accent, 0.4),
                background: "var(--kw-surface)",
                border: `1px solid ${isActive || isScanning ? accent : "var(--kw-line)"}`,
                borderRadius: "var(--kw-r-lg)",
                boxShadow: isActive
                    ? `0 0 0 3px ${withAlpha(accent, 0.18)}, 0 12px 32px -12px ${withAlpha(accent, 0.45)}`
                    : pressed
                        ? "0 0 0 1px var(--kw-line)"
                        : "var(--kw-shadow-sm)",
                transform: pressed ? "scale(0.985)" : undefined,
                minHeight: "200px",
                padding: "1.25rem 1.125rem 1.125rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                position: "relative",
                overflow: "hidden",
            }}
            onClick={fire}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseEnter={startDwell}
            onMouseLeave={() => { setPressed(false); cancelDwell(); }}
            onFocus={startDwell}
            onBlur={cancelDwell}
            aria-label={`${label}. ${audioText}`}
            aria-pressed={isActive}
            tabIndex={0}
        >
            {/* Dwell progress bar */}
            {dwellToSelect && dwellProgress > 0 && (
                <div
                    className="absolute top-0 left-0 h-1 transition-[width] pointer-events-none"
                    style={{
                        width: `${dwellProgress * 100}%`,
                        background: accent,
                        opacity: 0.7,
                    }}
                />
            )}

            {/* Top row: icon chip + meta */}
            <div className="w-full flex items-start justify-between">
                <div
                    className="flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 overflow-hidden"
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: tint,
                        color: accent,
                        boxShadow: `inset 0 0 0 1px ${withAlpha(accent, 0.10)}`,
                    }}
                >
                    {hasImage ? (
                        <img
                            src={action.image}
                            alt=""
                            className="w-12 h-12 object-contain"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <KwIcon name={action.iconKey || "alert"} size={32} strokeWidth={1.7} />
                    )}
                </div>

                <div className="flex flex-col items-end gap-1">
                    {isEmergency && (
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase"
                            style={{
                                background: "var(--kw-er)",
                                color: "white",
                                boxShadow: "0 4px 10px -2px rgba(207,58,46,0.4)",
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
                            {language === "ta" ? "அவசரம்" : "Urgent"}
                        </span>
                    )}
                    {usageCount > 0 && !isEmergency && (
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md font-display tabular-nums"
                            style={{
                                background: "var(--kw-bg-deep)",
                                color: "var(--kw-muted)",
                            }}
                            title={language === "ta" ? "இன்று பயன்பாடு" : "Used today"}
                        >
                            ×{usageCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Label */}
            <div className="w-full">
                <div
                    className="font-display font-semibold leading-[1.1] text-balance font-tamil"
                    style={{
                        color: "var(--kw-ink)",
                        fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                        letterSpacing: "-0.018em",
                    }}
                >
                    {label}
                </div>
                <div
                    className="text-xs mt-1.5 line-clamp-1"
                    style={{ color: "var(--kw-muted)" }}
                >
                    {language === "ta" ? action.labelEnglish : action.labelTamil}
                </div>
            </div>
        </button>
    );
}
