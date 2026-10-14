import { useMemo } from "react";
import { CATEGORIES, SUGGESTIONS } from "../data/defaultActions";
import ActionBlock from "../components/ActionBlock";
import EmergencyBanner from "../components/EmergencyBanner";
import PainScale from "../components/PainScale";
import SuggestionsStrip from "../components/SuggestionsStrip";
import FamilyCallPanel from "../components/FamilyCallPanel";
import TrackerSummaryPanel from "../components/TrackerSummaryPanel";
import DietSummaryCard from "../components/DietSummaryCard";
import MedicationReminderCard from "../components/MedicationReminderCard";
import VitalSignsPanel from "../components/VitalSignsPanel";
import KwIcon from "../components/icons/KwIcon";

function timeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}

function getGreeting(language) {
    const tod = timeOfDay();
    if (language === "ta") {
        return tod === "morning" ? "à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯" : tod === "afternoon" ? "à®®à®¤à®¿à®¯ à®µà®£à®•à¯à®•à®®à¯" : "à®®à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯";
    }
    return tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : "Good evening";
}

export default function BoardView({
    patient,
    actions,
    activeAction,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    language,
    nightMode,
    scanMode,
    scanIndex,
    dwellToSelect = false,
    dwellMs = 1200,
    usageToday,
    totalUsageToday,
    avgAckSeconds,
    trackerData,
    trackerGoals,
    dietData,
    dietGoals,
    medications,
    medLogs,
    vitals,
    onSelect,
    onPainPick,
    onEmergency,
    onCallNurse,
    onCallFamily,
    onManageFamily,
    onOpenTrackers,
    onOpenDiet,
    onOpenMedications,
    onToggleMedLog,
    onLogVitals,
}) {
    const tod = timeOfDay();
    const greeting = getGreeting(language);
    const now = new Date();
    const dateStr = now.toLocaleDateString(language === "ta" ? "ta-IN" : "en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
    const timeStr = now.toLocaleTimeString(language === "ta" ? "ta-IN" : "en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    /* Filter */
    const filteredActions = useMemo(() => {
        let list = actions;
        if (activeCategory !== "all") list = list.filter((a) => a.category === activeCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (a) =>
                    a.labelTamil?.toLowerCase().includes(q) ||
                    a.labelEnglish?.toLowerCase().includes(q) ||
                    a.audioTextEnglish?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [actions, activeCategory, searchQuery]);

    const categoryCounts = useMemo(() => {
        const counts = { all: actions.length };
        for (const a of actions) counts[a.category] = (counts[a.category] || 0) + 1;
        return counts;
    }, [actions]);

    const suggested = useMemo(() => {
        const ids = SUGGESTIONS[tod] || [];
        return ids.map((id) => actions.find((a) => a.id === id)).filter(Boolean);
    }, [actions, tod]);

    const normalizedScanIndex = filteredActions.length === 0 ? 0 : scanIndex % filteredActions.length;
    const firstName = patient?.firstName || patient?.name?.split(" ")[0] || "";

    return (
        <>
            {/* Two-column hero */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 mb-5 lg:items-start">
                {/* Greeting / pain scale + diet summary */}
                <section className="flex flex-col gap-4">
                    <div
                        className="rounded-3xl p-6"
                        style={{
                            background: "var(--kw-surface)",
                            border: "1px solid var(--kw-line)",
                            boxShadow: "var(--kw-shadow-sm)",
                        }}
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="min-w-0">
                                <div
                                    className="text-[11px] font-bold uppercase tracking-[0.16em] mb-2"
                                    style={{ color: "var(--kw-brand)" }}
                                >
                                    {dateStr} · {timeStr}
                                </div>
                                <h1
                                    className="font-display font-semibold leading-[1.05] text-balance font-tamil"
                                    style={{
                                        fontSize: "clamp(1.875rem, 3.6vw, 2.5rem)",
                                        color: "var(--kw-ink)",
                                        letterSpacing: "-0.025em",
                                    }}
                                >
                                    {greeting}, {firstName}.
                                </h1>
                                <p
                                    className="mt-2 text-balance font-tamil"
                                    style={{ color: "var(--kw-ink-soft)", fontSize: "0.95rem", maxWidth: "44ch" }}
                                >
                                    {language === "ta"
                                        ? "à®Žà®¨à¯à®¤ à®…à®Ÿà¯à®Ÿà¯ˆà®¯à¯ˆà®¯à¯à®®à¯ à®¤à®Ÿà¯à®Ÿà®¿ à®ªà¯‡à®šà¯à®µà¯€à®°à¯à®•à®³à¯ · à®…à®²à¯à®²à®¤à¯ à®•à¯€à®´à¯‡ à®µà®²à®¿à®¯à¯ˆ à®®à®¤à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®™à¯à®•à®³à¯."
                                        : "Tap any card to speak it aloud · or rate your pain below."}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Stat label={language === "ta" ? "à®‡à®©à¯à®±à¯" : "Today"} value={totalUsageToday} sublabel={language === "ta" ? "à®šà¯†à®¯à¯à®¤à®¿à®•à®³à¯" : "messages"} />
                                <Stat label={language === "ta" ? "à®šà®°à®¾à®šà®°à®¿" : "Avg ack"} value={`${avgAckSeconds}s`} sublabel={language === "ta" ? "à®ªà®¤à®¿à®²à¯" : "response"} />
                            </div>
                        </div>
                        <PainScale language={language} onPick={onPainPick} />
                    </div>

                    {/* Diet summary pie chart */}
                    <DietSummaryCard
                        dietData={dietData}
                        dietGoals={dietGoals}
                        language={language}
                        onNavigate={onOpenDiet}
                    />

                    {/* Vital signs */}
                    <VitalSignsPanel
                        vitals={vitals}
                        language={language}
                        onLog={onLogVitals}
                    />
                </section>

                {/* Emergency + family */}
                <section className="flex flex-col gap-4">
                    <EmergencyBanner
                        language={language}
                        holdMs={patient?.emergencyConfig?.holdMs || 800}
                        requireHold={patient?.emergencyConfig?.confirmWithHold ?? false}
                        onActivate={onEmergency}
                    />
                    <FamilyCallPanel
                        careTeam={patient?.careTeam || []}
                        language={language}
                        onCall={onCallFamily}
                        onManage={onManageFamily}
                    />
                    <TrackerSummaryPanel
                        trackerData={trackerData}
                        goals={trackerGoals}
                        language={language}
                        onNavigate={onOpenTrackers}
                    />
                    <MedicationReminderCard
                        medications={medications}
                        medLogs={medLogs}
                        language={language}
                        onNavigate={onOpenMedications}
                        onToggle={onToggleMedLog}
                    />
                </section>
            </div>

            {/* Suggestions */}
            {patient?.autoShowSuggestions !== false && suggested.length > 0 && (
                <div className="mb-4">
                    <SuggestionsStrip
                        suggestions={suggested}
                        language={language}
                        onPick={onSelect}
                        timeOfDay={tod}
                    />
                </div>
            )}

            {/* Search + categories */}
            <section className="flex flex-wrap items-center gap-3 mb-5">
                <div className="relative flex-1 min-w-[260px] max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--kw-muted)" }}>
                        <KwIcon name="search" size={16} />
                    </span>
                    <input
                        id="kw-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === "ta" ? "à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯à®•à®³à¯ˆà®¤à¯ à®¤à¯‡à®Ÿà¯…" : "Search phrases…"}
                        className="kw-input font-tamil pl-10 pr-12"
                    />
                    <kbd
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold hidden sm:block"
                        style={{
                            background: "var(--kw-bg-deep)",
                            border: "1px solid var(--kw-line)",
                            color: "var(--kw-muted)",
                        }}
                    >
                        /
                    </kbd>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(CATEGORIES).filter(([k]) => k !== "emergency").map(([key, value]) => {
                        const active = activeCategory === key;
                        const count = categoryCounts[key] || 0;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs transition-all"
                                style={{
                                    background: active ? "var(--kw-ink)" : "var(--kw-surface)",
                                    color: active ? "white" : "var(--kw-ink)",
                                    border: `1px solid ${active ? "var(--kw-ink)" : "var(--kw-line)"}`,
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: value.color }}
                                />
                                <span className="font-tamil">
                                    {language === "ta" ? value.labelTamil : value.labelEnglish}
                                </span>
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
            </section>

            {/* Grid */}
            <section
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
            >
                {filteredActions.map((action, index) => (
                    <ActionBlock
                        key={action.id}
                        action={action}
                        onSelect={onSelect}
                        isScanning={scanMode && normalizedScanIndex === index}
                        nightMode={nightMode}
                        language={language}
                        usageCount={usageToday[action.id] || 0}
                        isActive={activeAction?.id === action.id}
                        dwellToSelect={dwellToSelect}
                        dwellMs={dwellMs}
                    />
                ))}
                {filteredActions.length === 0 && (
                    <div
                        className="col-span-full rounded-3xl py-20 text-center"
                        style={{
                            border: "1.5px dashed var(--kw-line-strong)",
                            background: "oklch(1 0 0 / 0.4)",
                        }}
                    >
                        <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3" style={{ background: "var(--kw-bg-deep)", color: "var(--kw-muted)" }}>
                            <KwIcon name="search" size={26} strokeWidth={1.6} />
                        </div>
                        <p className="font-display font-semibold mb-1 font-tamil" style={{ color: "var(--kw-ink)" }}>
                            {searchQuery
                                ? (language === "ta" ? `"${searchQuery}" à®•à¯à®•à¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®®à¯ à®‡à®²à¯à®²à¯ˆ` : `No matches for "${searchQuery}"`)
                                : (language === "ta" ? "à®‡à®¨à¯à®¤ à®µà®•à¯ˆà®¯à®¿à®²à¯ à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ" : "No phrases in this category")}
                        </p>
                        <p className="text-xs" style={{ color: "var(--kw-muted)" }}>
                            {language === "ta" ? "à®µà¯‡à®±à¯ à®µà®•à¯ˆ à®…à®²à¯à®²à®¤à¯ à®¤à¯‡à®Ÿà®²à¯ à®šà¯Šà®±à¯à®•à®³à¯ˆ à®®à¯à®¯à®±à¯à®šà®¿à®•à¯à®•à®µà¯à®®à¯" : "Try a different category or search term"}
                        </p>
                    </div>
                )}
            </section>
        </>
    );
}

function Stat({ label, value, sublabel }) {
    return (
        <div
            className="rounded-2xl px-3.5 py-2 min-w-[100px]"
            style={{
                background: "var(--kw-bg-deep)",
                border: "1px solid var(--kw-line)",
            }}
        >
            <div
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--kw-muted)" }}
            >
                {label}
            </div>
            <div
                className="font-display font-semibold leading-tight tabular-nums"
                style={{
                    fontSize: "1.5rem",
                    color: "var(--kw-ink)",
                    letterSpacing: "-0.02em",
                }}
            >
                {value}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--kw-subtle)" }}>
                {sublabel}
            </div>
        </div>
    );
}
