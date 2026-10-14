import KwIcon from "../components/icons/KwIcon";

/* ─── Helpers ─── */
function fmtSleepHours(h) {
    if (h === 0) return "0";
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    if (mins === 0) return `${whole}`;
    if (whole === 0) return `${mins}m`;
    return `${whole}h ${mins}m`;
}

function getMetricStatus(value, goal) {
    if (goal == null || goal === 0) return "neutral";
    return value >= goal ? "met" : "unmet";
}

/* ─── Section header ─── */
function SectionHeader({ icon, color, tint, title, subtitle }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: tint, color }}>
                <KwIcon name={icon} size={22} strokeWidth={1.8} />
            </div>
            <div>
                <h2 className="font-display font-semibold font-tamil" style={{ fontSize: "1.1rem", color: "var(--kw-ink)", lineHeight: 1.2 }}>
                    {title}
                </h2>
                {subtitle && <p className="text-xs font-tamil mt-0.5" style={{ color: "var(--kw-muted)" }}>{subtitle}</p>}
            </div>
        </div>
    );
}

/* ─── Metric row with quick-add buttons and status border ─── */
function MetricRow({ label, value, unit, sublabel, accent, onReset, quickAdds, status = "neutral" }) {
    const borderColor = status === "met" ? "var(--kw-brand)" : status === "unmet" ? "var(--kw-er)" : "var(--kw-line)";
    const borderWidth = status === "neutral" ? "1px" : "2px";

    return (
        <div className="rounded-2xl p-4" style={{ background: "var(--kw-bg-deep)", border: `${borderWidth} solid ${borderColor}` }}>
            <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] font-tamil" style={{ color: "var(--kw-muted)" }}>
                            {label}
                        </div>
                        {status !== "neutral" && (
                            <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{
                                    background: status === "met" ? "var(--kw-brand-tint)" : "var(--kw-er-tint)",
                                    color: status === "met" ? "var(--kw-brand)" : "var(--kw-er)",
                                }}
                            >
                                {status === "met" ? "✓ Met" : "Below target"}
                            </span>
                        )}
                    </div>
                    <div className="font-display font-bold tabular-nums" style={{ fontSize: "2rem", color: "var(--kw-ink)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                        {value}
                        {unit && <span className="text-sm font-normal ml-1.5" style={{ color: "var(--kw-muted)" }}>{unit}</span>}
                    </div>
                    {sublabel && <div className="text-sm font-medium mt-0.5" style={{ color: accent || "var(--kw-muted)" }}>{sublabel}</div>}
                </div>
                <button
                    onClick={onReset}
                    className="mt-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all hover:opacity-70"
                    style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: "var(--kw-muted)" }}
                >
                    Reset
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {quickAdds.map(({ label: btnLabel, onClick, isDec }) => (
                    <button
                        key={btnLabel}
                        onClick={onClick}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold font-tamil transition-all hover:scale-[1.03] active:scale-[0.97]"
                        style={{
                            background: isDec ? "var(--kw-surface)" : `${accent}18`,
                            border: `1px solid ${isDec ? "var(--kw-line)" : `${accent}40`}`,
                            color: isDec ? "var(--kw-muted)" : (accent || "var(--kw-ink)"),
                            boxShadow: "var(--kw-shadow-xs)",
                        }}
                    >
                        {btnLabel}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Tracker section card ─── */
function TrackerCard({ icon, color, tint, title, subtitle, children }) {
    return (
        <section className="rounded-3xl p-6" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
            <SectionHeader icon={icon} color={color} tint={tint} title={title} subtitle={subtitle} />
            <div className="space-y-3">{children}</div>
        </section>
    );
}

/* ─── Goal stepper row ─── */
function GoalRow({ label, value, unit, step = 1, onSet }) {
    const display = value % 1 === 0 ? value : value.toFixed(1);
    return (
        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--kw-line)" }}>
            <div className="min-w-0 mr-3">
                <span className="text-sm font-semibold font-tamil" style={{ color: "var(--kw-ink)" }}>{label}</span>
                <span className="text-[10px] ml-2 font-tamil" style={{ color: "var(--kw-subtle)" }}>min</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => onSet(Math.max(0, +(value - step).toFixed(2)))}
                    disabled={value <= 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all hover:opacity-80"
                    style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", color: value <= 0 ? "var(--kw-subtle)" : "var(--kw-ink)" }}
                >
                    −
                </button>
                <div className="w-14 text-center font-display font-bold tabular-nums" style={{ fontSize: "1.15rem", color: "var(--kw-ink)", letterSpacing: "-0.015em" }}>
                    {display}
                </div>
                <span className="text-xs min-w-[3rem]" style={{ color: "var(--kw-muted)" }}>{unit}</span>
                <button
                    onClick={() => onSet(+(value + step).toFixed(2))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold transition-all hover:opacity-80"
                    style={{ background: "var(--kw-brand)", color: "white" }}
                >
                    +
                </button>
            </div>
        </div>
    );
}

/* ─── Main view ─── */
export default function TrackersView({ trackerData = {}, goals = {}, onUpdate, onReset, onGoalUpdate, language, patient }) {
    const water    = trackerData.water    || { glasses: 0 };
    const food     = trackerData.food     || { meals: 0, protein: 0, carbs: 0, vitamins: 0 };
    const restroom = trackerData.restroom || { visits: 0, urineML: 0 };
    const sleep    = trackerData.sleep    || { hours: 0 };

    const gw = goals.water    || { glasses: 0 };
    const gf = goals.food     || { meals: 0, protein: 0, carbs: 0, vitamins: 0 };
    const gr = goals.restroom || { visits: 0, urineML: 0 };
    const gs = goals.sleep    || { hours: 0 };

    const ta = language === "ta";

    const now = new Date();
    const dateStr = now.toLocaleDateString(ta ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const firstName = patient?.firstName || patient?.name?.split(" ")[0] || "";

    return (
        <>
            {/* Page header */}
            <div className="mb-7">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: "var(--kw-brand)" }}>
                    {dateStr}
                </div>
                <h1 className="font-display font-semibold font-tamil" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--kw-ink)", letterSpacing: "-0.025em" }}>
                    {ta ? `${firstName} · கண்காணிப்பு பதிவு` : `${firstName} · Daily Trackers`}
                </h1>
                <p className="text-sm font-tamil mt-1.5" style={{ color: "var(--kw-muted)" }}>
                    {ta
                        ? "செவிலியர் பதிவு — இன்றைய தரவு. சிவப்பு நிறம் = இலக்கு நிறைவேறவில்லை, பச்சை = நிறைவேறியது."
                        : "Nurse-facing panel. Red border = below target · Green border = target met."}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Daily Targets ── */}
                <section className="lg:col-span-2 rounded-3xl p-6" style={{ background: "var(--kw-surface)", border: "1px solid var(--kw-line)", boxShadow: "var(--kw-shadow-sm)" }}>
                    <SectionHeader
                        icon="chart"
                        color="var(--kw-brand)"
                        tint="var(--kw-brand-tint)"
                        title={ta ? "தினசரி குறைந்தபட்ச இலக்குகள்" : "Daily Minimum Targets"}
                        subtitle={ta ? "இந்த அளவுகளுக்கு கீழ் சென்றால் சிவப்பு நிறம் காட்டப்படும் · 0 = இலக்கு இல்லை" : "Values below these are flagged red · set 0 to disable a target"}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                        {/* Water */}
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1 pt-1" style={{ color: "var(--kw-comfort)" }}>
                                {ta ? "தண்ணீர்" : "Water"}
                            </div>
                            <GoalRow
                                label={ta ? "குறைந்தபட்ச கிளாஸ்" : "Min glasses / day"}
                                value={gw.glasses ?? 8} unit={ta ? "கிளாஸ்" : "glasses"}
                                step={1} onSet={(v) => onGoalUpdate("water", "glasses", v)}
                            />
                        </div>

                        {/* Sleep */}
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1 pt-1" style={{ color: "var(--kw-brand)" }}>
                                {ta ? "தூக்கம்" : "Sleep"}
                            </div>
                            <GoalRow
                                label={ta ? "குறைந்தபட்ச தூக்க நேரம்" : "Min sleep / day"}
                                value={gs.hours ?? 7} unit={ta ? "மணி" : "hrs"}
                                step={0.5} onSet={(v) => onGoalUpdate("sleep", "hours", v)}
                            />
                        </div>

                        {/* Food */}
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1 pt-3" style={{ color: "var(--kw-social)" }}>
                                {ta ? "உணவு" : "Food"}
                            </div>
                            <GoalRow label={ta ? "குறைந்தபட்ச உணவு வேளை"     : "Min meals"}        value={gf.meals    ?? 3}   unit={ta ? "வேளை"      : "meals"}       step={1}   onSet={(v) => onGoalUpdate("food", "meals",    v)} />
                            <GoalRow label={ta ? "குறைந்தபட்ச புரதம்"         : "Min protein"}      value={gf.protein  ?? 50}  unit="g"                                  step={5}   onSet={(v) => onGoalUpdate("food", "protein",  v)} />
                            <GoalRow label={ta ? "குறைந்தபட்ச கார்போஹைட்ரேட்": "Min carbohydrates"} value={gf.carbs    ?? 150} unit="g"                                  step={10}  onSet={(v) => onGoalUpdate("food", "carbs",    v)} />
                            <GoalRow label={ta ? "குறைந்தபட்ச வைட்டமின்"      : "Min vitamins"}     value={gf.vitamins ?? 1}   unit={ta ? "மாத்திரை" : "supplements"}   step={1}   onSet={(v) => onGoalUpdate("food", "vitamins", v)} />
                        </div>

                        {/* Restroom */}
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1 pt-3" style={{ color: "var(--kw-movement)" }}>
                                {ta ? "கழிவறை" : "Restroom"}
                            </div>
                            <GoalRow label={ta ? "குறைந்தபட்ச கழிவறை பயன்பாடு" : "Min visits"}         value={gr.visits  ?? 4}    unit={ta ? "முறை" : "visits"} step={1}   onSet={(v) => onGoalUpdate("restroom", "visits",  v)} />
                            <GoalRow label={ta ? "குறைந்தபட்ச சிறுநீர் அளவு"   : "Min urine output"}   value={gr.urineML ?? 1000} unit="ml"                      step={100} onSet={(v) => onGoalUpdate("restroom", "urineML", v)} />
                        </div>
                    </div>
                </section>

                {/* ── Water ── */}
                <TrackerCard
                    icon="dropOutline" color="var(--kw-comfort)" tint="var(--kw-comfort-tint)"
                    title={ta ? "தண்ணீர் கண்காணிப்பு" : "Water Intake"}
                    subtitle={ta ? "ஒரு கிளாஸ் = 250 மி.லி" : "1 glass = 250 ml"}
                >
                    <MetricRow
                        label={ta ? "கிளாஸ் மற்றும் லிட்டர்" : "Glasses & Litres"}
                        value={water.glasses} unit={ta ? "கிளாஸ்" : "glasses"}
                        sublabel={`${(water.glasses * 0.25).toFixed(2)} L`}
                        accent="var(--kw-comfort)"
                        status={getMetricStatus(water.glasses, gw.glasses)}
                        onReset={() => onReset("water", "glasses")}
                        quickAdds={[
                            { label: ta ? "+1 கிளாஸ்"           : "+1 glass",          onClick: () => onUpdate("water", "glasses", 1) },
                            { label: ta ? "+2 கிளாஸ் (500மிலி)" : "+2 glasses (500 ml)", onClick: () => onUpdate("water", "glasses", 2) },
                            { label: ta ? "+4 கிளாஸ் (1 L)"     : "+4 glasses (1 L)",  onClick: () => onUpdate("water", "glasses", 4) },
                            { label: ta ? "−1 கிளாஸ்"            : "−1 glass",         onClick: () => onUpdate("water", "glasses", -1), isDec: true },
                        ]}
                    />
                </TrackerCard>

                {/* ── Food ── */}
                <TrackerCard
                    icon="food" color="var(--kw-social)" tint="var(--kw-social-tint)"
                    title={ta ? "உணவு கண்காணிப்பு" : "Food & Nutrition"}
                    subtitle={ta ? "உணவு வேளை மற்றும் ஊட்டச்சத்து" : "Meals and macronutrient tracking"}
                >
                    <MetricRow
                        label={ta ? "உணவு வேளை" : "Meals"} value={food.meals} unit={ta ? "வேளை" : "meals"}
                        accent="var(--kw-social)" status={getMetricStatus(food.meals, gf.meals)}
                        onReset={() => onReset("food", "meals")}
                        quickAdds={[
                            { label: ta ? "+1 வேளை" : "+1 meal", onClick: () => onUpdate("food", "meals", 1) },
                            { label: ta ? "−1 வேளை" : "−1 meal", onClick: () => onUpdate("food", "meals", -1), isDec: true },
                        ]}
                    />
                    <MetricRow
                        label={ta ? "புரதம்" : "Protein"} value={food.protein} unit="g"
                        accent="var(--kw-social)" status={getMetricStatus(food.protein, gf.protein)}
                        onReset={() => onReset("food", "protein")}
                        quickAdds={[
                            { label: "+5 g",  onClick: () => onUpdate("food", "protein", 5) },
                            { label: "+10 g", onClick: () => onUpdate("food", "protein", 10) },
                            { label: "+25 g", onClick: () => onUpdate("food", "protein", 25) },
                            { label: "−5 g",  onClick: () => onUpdate("food", "protein", -5),  isDec: true },
                        ]}
                    />
                    <MetricRow
                        label={ta ? "கார்போஹைட்ரேட்" : "Carbohydrates"} value={food.carbs} unit="g"
                        accent="var(--kw-social)" status={getMetricStatus(food.carbs, gf.carbs)}
                        onReset={() => onReset("food", "carbs")}
                        quickAdds={[
                            { label: "+10 g", onClick: () => onUpdate("food", "carbs", 10) },
                            { label: "+25 g", onClick: () => onUpdate("food", "carbs", 25) },
                            { label: "+50 g", onClick: () => onUpdate("food", "carbs", 50) },
                            { label: "−10 g", onClick: () => onUpdate("food", "carbs", -10), isDec: true },
                        ]}
                    />
                    <MetricRow
                        label={ta ? "வைட்டமின் மாத்திரை" : "Vitamin Supplements"} value={food.vitamins} unit={ta ? "மாத்திரை" : "taken"}
                        accent="var(--kw-social)" status={getMetricStatus(food.vitamins, gf.vitamins)}
                        onReset={() => onReset("food", "vitamins")}
                        quickAdds={[
                            { label: ta ? "+1 மாத்திரை" : "+1 supplement", onClick: () => onUpdate("food", "vitamins", 1) },
                            { label: ta ? "−1 மாத்திரை" : "−1 supplement", onClick: () => onUpdate("food", "vitamins", -1), isDec: true },
                        ]}
                    />
                </TrackerCard>

                {/* ── Restroom ── */}
                <TrackerCard
                    icon="bathroom" color="var(--kw-movement)" tint="var(--kw-movement-tint)"
                    title={ta ? "கழிவறை கண்காணிப்பு" : "Restroom Tracker"}
                    subtitle={ta ? "பயன்பாட்டின் எண்ணிக்கை மற்றும் சிறுநீர் அளவு" : "Visit count and urine output measurement"}
                >
                    <MetricRow
                        label={ta ? "கழிவறை பயன்பாடு" : "Restroom Visits"} value={restroom.visits} unit={ta ? "முறை" : "visits"}
                        accent="var(--kw-movement)" status={getMetricStatus(restroom.visits, gr.visits)}
                        onReset={() => onReset("restroom", "visits")}
                        quickAdds={[
                            { label: ta ? "+1 முறை" : "+1 visit", onClick: () => onUpdate("restroom", "visits", 1) },
                            { label: ta ? "−1 முறை" : "−1 visit", onClick: () => onUpdate("restroom", "visits", -1), isDec: true },
                        ]}
                    />
                    <MetricRow
                        label={ta ? "சிறுநீர் அளவு" : "Urine Output"} value={restroom.urineML} unit="ml"
                        sublabel={`${(restroom.urineML / 1000).toFixed(2)} L`}
                        accent="var(--kw-movement)" status={getMetricStatus(restroom.urineML, gr.urineML)}
                        onReset={() => onReset("restroom", "urineML")}
                        quickAdds={[
                            { label: "+100 ml", onClick: () => onUpdate("restroom", "urineML", 100) },
                            { label: "+250 ml", onClick: () => onUpdate("restroom", "urineML", 250) },
                            { label: "+500 ml", onClick: () => onUpdate("restroom", "urineML", 500) },
                            { label: "−100 ml", onClick: () => onUpdate("restroom", "urineML", -100), isDec: true },
                        ]}
                    />
                </TrackerCard>

                {/* ── Sleep ── */}
                <TrackerCard
                    icon="moon" color="var(--kw-brand)" tint="var(--kw-brand-tint)"
                    title={ta ? "தூக்க கண்காணிப்பு" : "Sleep Tracker"}
                    subtitle={ta ? "மொத்த தூக்க நேரம்" : "Total sleep duration for this period"}
                >
                    <MetricRow
                        label={ta ? "தூக்க நேரம்" : "Sleep Duration"}
                        value={fmtSleepHours(sleep.hours)} unit={ta ? "மணி நேரம்" : "hours"}
                        sublabel={sleep.hours > 0 ? `${sleep.hours} hr` : undefined}
                        accent="var(--kw-brand)" status={getMetricStatus(sleep.hours, gs.hours)}
                        onReset={() => onReset("sleep", "hours")}
                        quickAdds={[
                            { label: ta ? "+30 நிமிடம்" : "+30 min", onClick: () => onUpdate("sleep", "hours", 0.5) },
                            { label: ta ? "+1 மணி"      : "+1 hr",   onClick: () => onUpdate("sleep", "hours", 1) },
                            { label: ta ? "+2 மணி"      : "+2 hrs",  onClick: () => onUpdate("sleep", "hours", 2) },
                            { label: ta ? "+4 மணி"      : "+4 hrs",  onClick: () => onUpdate("sleep", "hours", 4) },
                            { label: ta ? "−30 நிமிடம்": "−30 min", onClick: () => onUpdate("sleep", "hours", -0.5), isDec: true },
                            { label: ta ? "−1 மணி"     : "−1 hr",   onClick: () => onUpdate("sleep", "hours", -1),   isDec: true },
                        ]}
                    />
                </TrackerCard>
            </div>
        </>
    );
}
