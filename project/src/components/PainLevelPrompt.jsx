import { useEffect, useState } from "react";
import KwIcon from "./icons/KwIcon";

const STOPS = [
    { bg: "#5fa66a", fg: "#ffffff" },
    { bg: "#85ac4f", fg: "#ffffff" },
    { bg: "#a3a73c", fg: "#ffffff" },
    { bg: "#c3a032", fg: "#ffffff" },
    { bg: "#d68d2c", fg: "#ffffff" },
    { bg: "#dc7530", fg: "#ffffff" },
    { bg: "#dc5e3a", fg: "#ffffff" },
    { bg: "#d24a3a", fg: "#ffffff" },
    { bg: "#bf3a30", fg: "#ffffff" },
    { bg: "#a72e26", fg: "#ffffff" },
];

export default function PainLevelPrompt({ action, language, onConfirm, onSkip, onCancel }) {
    const [picked, setPicked] = useState(null);

    /* Reset when action changes */
    useEffect(() => {
        setPicked(null);
    }, [action?.id]);

    /* Escape to cancel */
    useEffect(() => {
        if (!action) return;
        const handler = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [action, onCancel]);

    if (!action) return null;

    const ta = language === "ta";
    const accent = action.color || "#3a8e88";
    const rawBase = ta ? action.audioTextTamil : action.audioTextEnglish;
    const cleanBase = rawBase.replace(/[.\s]+$/, "");   // strip any trailing period/space
    const painSuffix = picked != null
        ? (ta ? `. என் வலி ${picked} க்கு 10.` : `. My pain level is ${picked} out of 10.`)
        : "";
    const previewText = cleanBase + (painSuffix || ".");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "oklch(0.15 0.01 60 / 0.55)", backdropFilter: "blur(10px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
            role="dialog"
            aria-modal="true"
            aria-label={ta ? "வலி அளவு" : "Pain level prompt"}
        >
            <div
                className="w-full max-w-lg rounded-3xl overflow-hidden"
                style={{
                    background: "var(--kw-surface)",
                    boxShadow: "var(--kw-shadow-xl)",
                    border: "1px solid var(--kw-line)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-5"
                    style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: `${accent}18`, color: accent }}
                        >
                            {action.image
                                ? <img src={action.image} alt="" className="w-7 h-7 object-contain" />
                                : <KwIcon name={action.iconKey || "alert"} size={20} strokeWidth={1.8} />
                            }
                        </div>
                        <div className="min-w-0">
                            <p
                                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                                style={{ color: "var(--kw-subtle)" }}
                            >
                                {ta ? "சொல்லப்படும்" : "You're about to say"}
                            </p>
                            <p
                                className="font-display font-semibold font-tamil text-sm leading-tight truncate"
                                style={{ color: "var(--kw-ink)" }}
                            >
                                {ta ? action.labelTamil : action.labelEnglish}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-xl flex items-center justify-center ml-3 shrink-0 transition-all hover:opacity-70"
                        style={{ background: "var(--kw-surface)", color: "var(--kw-muted)", border: "1px solid var(--kw-line)" }}
                        aria-label={ta ? "மூடு" : "Close"}
                    >
                        <KwIcon name="close" size={14} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Pain scale */}
                <div className="p-5">
                    <div className="mb-4">
                        <h3
                            className="font-display font-semibold font-tamil"
                            style={{ fontSize: "1.05rem", color: "var(--kw-ink)", letterSpacing: "-0.01em" }}
                        >
                            {ta ? "உங்கள் வலி அளவு என்ன?" : "What is your pain level?"}
                        </h3>
                        <p className="text-xs font-tamil mt-0.5" style={{ color: "var(--kw-muted)" }}>
                            {ta
                                ? "ஒரு எண்ணை தட்டவும் — வாக்கியத்தில் சேர்க்கப்படும்."
                                : "Tap a number — it will be appended to the spoken phrase."}
                        </p>
                    </div>

                    {/* Scale labels */}
                    <div
                        className="flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] mb-2"
                        style={{ color: "var(--kw-subtle)" }}
                    >
                        <span>{ta ? "இல்லை" : "None"}</span>
                        <span>{ta ? "மிதம்" : "Mild"}</span>
                        <span>{ta ? "கடுமை" : "Severe"}</span>
                    </div>

                    {/* Buttons 1–10 */}
                    <div className="grid grid-cols-10 gap-1.5 mb-5">
                        {STOPS.map((stop, idx) => {
                            const n = idx + 1;
                            const filled = picked != null && n <= picked;
                            const isPicked = picked === n;
                            return (
                                <button
                                    key={n}
                                    onClick={() => setPicked(n)}
                                    className="aspect-square rounded-xl font-display font-bold transition-all"
                                    style={{
                                        background: filled ? stop.bg : "var(--kw-bg-deep)",
                                        color: filled ? stop.fg : "var(--kw-muted)",
                                        fontSize: "1.0625rem",
                                        border: `1px solid ${filled ? "transparent" : "var(--kw-line)"}`,
                                        boxShadow: isPicked
                                            ? `0 0 0 3px ${stop.bg}33, 0 8px 18px -4px ${stop.bg}55, inset 0 1px 0 0 oklch(1 0 0 / 0.25)`
                                            : filled
                                                ? "inset 0 1px 0 0 oklch(1 0 0 / 0.18), 0 1px 2px oklch(0 0 0 / 0.06)"
                                                : "inset 0 1px 0 0 oklch(1 0 0 / 0.4)",
                                        transform: isPicked ? "translateY(-2px) scale(1.06)" : undefined,
                                    }}
                                    aria-label={`${ta ? "வலி" : "Pain"} ${n}/10`}
                                    aria-pressed={isPicked}
                                >
                                    {n}
                                </button>
                            );
                        })}
                    </div>

                    {/* Preview of what will be spoken */}
                    <div
                        className="rounded-xl p-3.5 mb-4 min-h-[52px] text-sm font-tamil leading-relaxed transition-all"
                        style={{
                            background: picked != null ? "var(--kw-brand-tint)" : "var(--kw-bg-deep)",
                            border: `1px solid ${picked != null ? "var(--kw-brand)33" : "var(--kw-line)"}`,
                            color: picked != null ? "var(--kw-brand-ink)" : "var(--kw-muted)",
                        }}
                    >
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1"
                            style={{ opacity: 0.65 }}
                        >
                            {ta ? "பேசப்படும் வாக்கியம்" : "Will be spoken"}
                        </span>
                        {previewText}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={onSkip}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80 font-tamil"
                            style={{
                                borderColor: "var(--kw-line)",
                                color: "var(--kw-ink-soft)",
                                background: "var(--kw-bg-deep)",
                            }}
                        >
                            {ta ? "வலி இல்லாமல் பேசு" : "Speak without pain level"}
                        </button>
                        <button
                            onClick={() => picked != null && onConfirm(picked)}
                            disabled={picked == null}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all font-tamil"
                            style={{
                                background: picked != null ? STOPS[picked - 1].bg : "var(--kw-line-strong)",
                                cursor: picked == null ? "not-allowed" : "pointer",
                                opacity: picked == null ? 0.5 : 1,
                            }}
                        >
                            {picked != null
                                ? (ta ? "வலி அளவுடன் பேசு" : "Speak with pain level")
                                : (ta ? "எண்ணை தேர்வு செய்க" : "Select a number first")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
