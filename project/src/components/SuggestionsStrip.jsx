import KwIcon from "./icons/KwIcon";

export default function SuggestionsStrip({ suggestions, language, onPick, timeOfDay }) {
    if (!suggestions || suggestions.length === 0) return null;

    const headerLabel = {
        morning:   language === "ta" ? "காலைக்கான பரிந்துரைகள்" : "Suggested for morning",
        afternoon: language === "ta" ? "மதியத்திற்கான பரிந்துரைகள்" : "Suggested for afternoon",
        evening:   language === "ta" ? "மாலைக்கான பரிந்துரைகள்" : "Suggested for evening",
    }[timeOfDay] || (language === "ta" ? "பரிந்துரைகள்" : "Suggested");

    return (
        <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar"
            style={{
                background: "var(--kw-brand-tint)",
                border: "1px solid var(--kw-line)",
            }}
        >
            <div className="inline-flex items-center gap-2 shrink-0 pr-2 mr-1" style={{ borderRight: "1px solid var(--kw-brand)33" }}>
                <span style={{ color: "var(--kw-brand)" }}>
                    <KwIcon name="sparkle" size={14} strokeWidth={1.8} />
                </span>
                <span
                    className="text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap"
                    style={{ color: "var(--kw-brand-ink)" }}
                >
                    {headerLabel}
                </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {suggestions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => onPick(action)}
                        className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full font-semibold text-[13px] transition-all hover:scale-[1.02] active:scale-95 shrink-0"
                        style={{
                            background: "var(--kw-surface)",
                            border: "1px solid var(--kw-line)",
                            color: "var(--kw-ink)",
                        }}
                    >
                        <span
                            className="rounded-full flex items-center justify-center"
                            style={{
                                width: 24,
                                height: 24,
                                background: action.tint,
                                color: action.color,
                            }}
                        >
                            <KwIcon name={action.iconKey} size={14} strokeWidth={1.8} />
                        </span>
                        <span className="font-tamil whitespace-nowrap">
                            {language === "ta" ? action.labelTamil : action.labelEnglish}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
