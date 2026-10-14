import { useMemo, useState } from "react";
import { CATEGORIES } from "../data/defaultActions";
import KwIcon from "../components/icons/KwIcon";

function startOfToday() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
}

function formatTime(ts, language) {
    return new Date(ts).toLocaleTimeString(language === "ta" ? "ta-IN" : "en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const FAKE_ACK = ["Nurse Akiko", "Dr. Hammond", "Nurse Park", "Dr. Lee", "Tech Reyes"];
function pseudoAck(seed) {
    if (!seed) return { who: "Care team", seconds: 38 };
    const n = String(seed).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    return {
        who: FAKE_ACK[n % FAKE_ACK.length],
        seconds: 18 + (n % 60),
    };
}

export default function HistoryView({ patient, logs, language }) {
    const [filterCategory, setFilterCategory] = useState("all");

    /* Today-only logs (excluding scroll) */
    const todayLogs = useMemo(() => {
        const cutoff = startOfToday();
        return logs.filter((l) => {
            const t = new Date(l.timestamp).getTime();
            return t >= cutoff && l.interactionType !== "scroll";
        });
    }, [logs]);

    const filtered = useMemo(() => {
        if (filterCategory === "all") return todayLogs;
        return todayLogs.filter((l) => l.category === filterCategory);
    }, [todayLogs, filterCategory]);

    const categoryCounts = useMemo(() => {
        const counts = { all: todayLogs.length };
        for (const l of todayLogs) counts[l.category] = (counts[l.category] || 0) + 1;
        return counts;
    }, [todayLogs]);

    const stats = useMemo(() => {
        const messages = todayLogs.length;
        const emergencies = todayLogs.filter((l) => l.category === "emergency").length;
        const acks = todayLogs.map((l) => pseudoAck(l.id).seconds);
        const avgAck = acks.length ? Math.round(acks.reduce((a, b) => a + b, 0) / acks.length) : 0;
        const counts = {};
        for (const l of todayLogs) {
            const key = l.labelEnglish || l.labelTamil || "—";
            counts[key] = (counts[key] || 0) + 1;
        }
        let mostUsed = "—";
        let mostUsedCount = 0;
        for (const [k, v] of Object.entries(counts)) {
            if (v > mostUsedCount) {
                mostUsed = k;
                mostUsedCount = v;
            }
        }
        return { messages, emergencies, avgAck, mostUsed, mostUsedCount };
    }, [todayLogs]);

    return (
        <>
            <div className="mb-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--kw-subtle)" }}>
                    {language === "ta" ? "செயல்பாடு பதிவு" : "Activity log"}
                </div>
                <h1
                    className="font-display font-semibold text-balance leading-[1.05]"
                    style={{ fontSize: "clamp(1.875rem, 3.6vw, 2.5rem)", color: "var(--kw-ink)", letterSpacing: "-0.025em" }}
                >
                    {language === "ta" ? "இன்றைய தொடர்புகள்" : "Today's communication"}
                </h1>
                <p className="mt-2 max-w-[60ch] font-tamil" style={{ color: "var(--kw-muted)" }}>
                    {language === "ta"
                        ? "ஒவ்வொரு செய்தியும் பராமரிப்பு குழுவிற்காக பதிவு செய்யப்படுகிறது. இன்றைய சராசரி பதில் நேரம் "
                        : "Every message is logged for the care team. Avg response time today is "}
                    <strong style={{ color: "var(--kw-ink)" }}>{stats.avgAck}s</strong>.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-3xl">
                <StatCard label={language === "ta" ? "இன்று" : "Today"} value={stats.messages} sublabel={language === "ta" ? "செய்திகள்" : "messages"} />
                <StatCard label={language === "ta" ? "அவசரம்" : "Emergency"} value={stats.emergencies} sublabel={language === "ta" ? "எச்சரிக்கைகள்" : "alerts"} accent={stats.emergencies > 0 ? "var(--kw-er)" : undefined} />
                <StatCard label={language === "ta" ? "சராசரி" : "Avg ack"} value={`${stats.avgAck}s`} sublabel={language === "ta" ? "பதில்" : "response"} />
                <StatCard label={language === "ta" ? "அதிகம்" : "Most used"} value={stats.mostUsed} sublabel={`${stats.mostUsedCount}× ${language === "ta" ? "இன்று" : "today"}`} small />
            </div>

            {/* Category tabs */}
            <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl mb-4" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}>
                {[["all", { labelEnglish: "All", labelTamil: "அனைத்தும்", color: "var(--kw-ink)" }], ...Object.entries(CATEGORIES).filter(([k]) => k !== "all" && k !== "emergency")].map(([key, value]) => {
                    const active = filterCategory === key;
                    const count = categoryCounts[key] || 0;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilterCategory(key)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all"
                            style={{
                                background: active ? "var(--kw-ink)" : "transparent",
                                color: active ? "white" : "var(--kw-ink)",
                            }}
                        >
                            {key !== "all" && (
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: value.color }} />
                            )}
                            <span className="font-tamil">{language === "ta" ? value.labelTamil : value.labelEnglish}</span>
                            <span
                                className="text-[10px] px-1 rounded font-bold tabular-nums"
                                style={{
                                    background: active ? "oklch(1 0 0 / 0.18)" : "var(--kw-bg-deep)",
                                    color: active ? "white" : "var(--kw-muted)",
                                }}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "var(--kw-surface)",
                    border: "1px solid var(--kw-line)",
                }}
            >
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--kw-line)", background: "var(--kw-bg-deep)" }}>
                            <Th>{language === "ta" ? "நேரம்" : "Time"}</Th>
                            <Th>{language === "ta" ? "சொற்றொடர்" : "Phrase"}</Th>
                            <Th className="hidden md:table-cell">{language === "ta" ? "வகை" : "Category"}</Th>
                            <Th className="hidden lg:table-cell">{language === "ta" ? "ஒப்புக்கொண்டவர்" : "Acknowledged by"}</Th>
                            <Th className="text-right">{language === "ta" ? "பதில்" : "Ack time"}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <KwIcon name="history" size={28} className="mx-auto mb-2" />
                                    <div className="text-sm font-tamil" style={{ color: "var(--kw-muted)" }}>
                                        {language === "ta" ? "இன்னும் செய்திகள் பதிவாகவில்லை" : "No messages logged yet today"}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filtered.map((log) => {
                            const cat = CATEGORIES[log.category];
                            const ack = pseudoAck(log.id);
                            const isUrgent = log.category === "emergency";
                            return (
                                <tr
                                    key={log.id}
                                    style={{ borderBottom: "1px solid var(--kw-line)" }}
                                    className="hover:bg-stone-50/40"
                                >
                                    <Td className="font-mono tabular-nums whitespace-nowrap" style={{ color: "var(--kw-muted)" }}>
                                        {formatTime(log.timestamp, language)}
                                    </Td>
                                    <Td>
                                        <span className="font-display font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>
                                            {language === "ta" ? log.labelTamil : log.labelEnglish}
                                        </span>
                                        {isUrgent && (
                                            <span
                                                className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                                style={{ background: "var(--kw-er-tint)", color: "var(--kw-er)" }}
                                            >
                                                {language === "ta" ? "அவசரம்" : "Urgent"}
                                            </span>
                                        )}
                                    </Td>
                                    <Td className="hidden md:table-cell">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                            style={{
                                                background: cat?.tint || "var(--kw-bg-deep)",
                                                color: cat?.color || "var(--kw-muted)",
                                            }}
                                        >
                                            <span className="w-1 h-1 rounded-full" style={{ background: cat?.color || "var(--kw-muted)" }} />
                                            {cat ? (language === "ta" ? cat.labelTamil : cat.labelEnglish) : log.category}
                                        </span>
                                    </Td>
                                    <Td className="hidden lg:table-cell" style={{ color: "var(--kw-ink-soft)" }}>
                                        {ack.who}
                                    </Td>
                                    <Td className="text-right tabular-nums font-semibold" style={{ color: "var(--kw-brand)" }}>
                                        {ack.seconds}s
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function StatCard({ label, value, sublabel, accent, small }) {
    return (
        <div
            className="rounded-2xl px-4 py-3"
            style={{
                background: "var(--kw-surface)",
                border: "1px solid var(--kw-line)",
            }}
        >
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--kw-muted)" }}>
                {label}
            </div>
            <div
                className="font-display font-semibold leading-tight font-tamil truncate"
                style={{
                    fontSize: small ? "1.1rem" : "1.875rem",
                    color: accent || "var(--kw-ink)",
                    letterSpacing: "-0.02em",
                }}
                title={typeof value === "string" ? value : undefined}
            >
                {value}
            </div>
            {sublabel && (
                <div className="text-[10px] mt-0.5 font-tamil" style={{ color: "var(--kw-subtle)" }}>
                    {sublabel}
                </div>
            )}
        </div>
    );
}

function Th({ children, className = "" }) {
    return (
        <th
            className={`text-left font-bold text-[10px] uppercase tracking-[0.14em] px-4 py-3 ${className}`}
            style={{ color: "var(--kw-muted)" }}
        >
            {children}
        </th>
    );
}

function Td({ children, className = "", style }) {
    return (
        <td className={`px-4 py-3 ${className}`} style={style}>
            {children}
        </td>
    );
}
