import { useState } from "react";

/**
 * 1-10 gradient stops: green → yellow → orange → red.
 * Buttons fill up to the picked number (like a gauge) — buttons above the
 * picked value stay neutral/grey. Pick 7 → buttons 1-7 light up; 8-10 stay grey.
 * Pick 10 → full gradient fills.
 */
const STOPS = [
    { bg: "#5fa66a", fg: "#ffffff" }, // 1  green
    { bg: "#85ac4f", fg: "#ffffff" }, // 2  green-olive
    { bg: "#a3a73c", fg: "#ffffff" }, // 3  yellow-green
    { bg: "#c3a032", fg: "#ffffff" }, // 4  amber
    { bg: "#d68d2c", fg: "#ffffff" }, // 5  orange
    { bg: "#dc7530", fg: "#ffffff" }, // 6  orange-red
    { bg: "#dc5e3a", fg: "#ffffff" }, // 7  red-orange
    { bg: "#d24a3a", fg: "#ffffff" }, // 8  red
    { bg: "#bf3a30", fg: "#ffffff" }, // 9  deep red
    { bg: "#a72e26", fg: "#ffffff" }, // 10 darkest red
];

export default function PainScale({ language, onPick }) {
    const [picked, setPicked] = useState(null);

    const select = (n) => {
        setPicked(n);
        onPick?.(n);
    };

    return (
        <div
            className="rounded-2xl p-5"
            style={{
                background: "var(--kw-surface)",
                border: "1px solid var(--kw-line)",
            }}
        >
            <div className="flex items-baseline justify-between mb-3">
                <div className="font-display font-semibold" style={{ fontSize: "1.0625rem", color: "var(--kw-ink)", letterSpacing: "-0.01em" }}>
                    {language === "ta" ? "உங்கள் வலி இப்போது எப்படி உள்ளது?" : "How is your pain right now?"}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--kw-muted)" }}>
                    {picked == null ? (
                        <span>{language === "ta" ? "எண்ணைத் தேர்வு செய்க" : "Pick a number"}</span>
                    ) : (
                        <span>
                            {language === "ta" ? "நீங்கள் சொன்னது" : "You said"}{" "}
                            <strong style={{ color: STOPS[picked - 1].bg }}>{picked}/10</strong>
                        </span>
                    )}
                </div>
            </div>

            <div
                className="flex justify-between text-[10px] font-bold uppercase tracking-[0.14em] mb-2"
                style={{ color: "var(--kw-subtle)" }}
            >
                <span>{language === "ta" ? "இல்லை" : "None"}</span>
                <span className="text-center">{language === "ta" ? "மிதம்" : "Mild"}</span>
                <span>{language === "ta" ? "கடுமை" : "Severe"}</span>
            </div>

            <div className="grid grid-cols-10 gap-1.5">
                {STOPS.map((stop, idx) => {
                    const n = idx + 1;
                    const filled = picked != null && n <= picked;
                    const isPicked = picked === n;
                    return (
                        <button
                            key={n}
                            onClick={() => select(n)}
                            className="aspect-square rounded-xl font-display font-bold transition-all"
                            style={{
                                background: filled ? stop.bg : "var(--kw-bg-deep)",
                                color: filled ? stop.fg : "var(--kw-muted)",
                                fontSize: "1.0625rem",
                                border: `1px solid ${filled ? "transparent" : "var(--kw-line)"}`,
                                boxShadow: isPicked
                                    ? `0 0 0 3px ${stop.bg}33, 0 8px 18px -4px ${stop.bg}66, inset 0 1px 0 0 oklch(1 0 0 / 0.25)`
                                    : filled
                                        ? "inset 0 1px 0 0 oklch(1 0 0 / 0.18), 0 1px 2px oklch(0 0 0 / 0.06)"
                                        : "inset 0 1px 0 0 oklch(1 0 0 / 0.4)",
                                transform: isPicked ? "translateY(-2px) scale(1.06)" : undefined,
                            }}
                            aria-label={`${language === "ta" ? "வலி" : "Pain"} ${n}/10`}
                            aria-pressed={isPicked}
                        >
                            {n}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
