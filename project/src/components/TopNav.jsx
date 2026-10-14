import KwIcon from "./icons/KwIcon";

const TABS = [
    { id: "board",       iconKey: "home",        labelTa: "பலகை",          labelEn: "Board" },
    { id: "trackers",    iconKey: "chart",        labelTa: "கண்காணி",       labelEn: "Trackers" },
    { id: "diet",        iconKey: "calendarGrid", labelTa: "உணவு அட்டவணை", labelEn: "Diet" },
    { id: "medications", iconKey: "pill",         labelTa: "மருந்துகள்",    labelEn: "Meds" },
    { id: "history",     iconKey: "history",      labelTa: "வரலாறு",        labelEn: "History" },
    { id: "settings",    iconKey: "settings",     labelTa: "அமைப்பு",       labelEn: "Settings" },
];

export default function TopNav({ value, onChange, language }) {
    return (
        <nav
            className="inline-flex items-center gap-0.5 p-1 rounded-2xl overflow-x-auto"
            style={{
                background: "var(--kw-bg-deep)",
                border: "1px solid var(--kw-line)",
                maxWidth: "min(100vw - 200px, 560px)",
            }}
            role="tablist"
        >
            {TABS.map((tab) => {
                const active = value === tab.id;
                return (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all shrink-0"
                        style={{
                            background: active ? "var(--kw-surface)" : "transparent",
                            color: active ? "var(--kw-ink)" : "var(--kw-muted)",
                            boxShadow: active ? "var(--kw-shadow-sm)" : "none",
                        }}
                    >
                        <KwIcon name={tab.iconKey} size={15} strokeWidth={1.8} />
                        <span className="font-tamil hidden sm:inline">
                            {language === "ta" ? tab.labelTa : tab.labelEn}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
