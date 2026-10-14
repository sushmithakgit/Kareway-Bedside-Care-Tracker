import { useEffect, useMemo, useState } from "react";
import KwIcon from "../components/icons/KwIcon";
import AdminPanel from "../components/AdminPanel";

const SECTIONS = [
    { id: "voice",      labelTa: "à®•à¯à®°à®²à¯ & à®®à¯Šà®´à®¿", labelEn: "Voice & language" },
    { id: "a11y",       labelTa: "à®…à®£à¯à®•à®²à¯",        labelEn: "Accessibility" },
    { id: "emergency",  labelTa: "à®…à®µà®šà®°à®®à¯",        labelEn: "Emergency" },
    { id: "phrases",    labelTa: "à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯à®•à®³à¯",  labelEn: "Phrases" },
    { id: "care",       labelTa: "à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ à®•à¯à®´à¯", labelEn: "Care team" },
    { id: "privacy",    labelTa: "à®¤à®©à®¿à®¯à¯à®°à®¿à®®à¯ˆ",     labelEn: "Privacy & audit" },
];

export default function SettingsView({
    patient,
    onUpdatePatient,
    language,
    setLanguage,
    /* phrases / actions */
    actions,
    onActionAdd,
    onActionEdit,
    onActionDelete,
    onActionReorder,
    onActionReset,
    logs,
    syncState,
    onRequestConfirm,
    /* settings affecting global app */
    nightMode,
    setNightMode,
    scanMode,
    setScanMode,
    scanInterval,
    setScanInterval,
}) {
    const [section, setSection] = useState("voice");

    return (
        <>
            <div className="mb-7">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: "var(--kw-subtle)" }}>
                    {language === "ta" ? "à®¨à¯‹à®¯à®¾à®³à®°à¯" : "Patient"} · {patient?.name?.toUpperCase() || "—"}
                </div>
                <h1
                    className="font-display font-semibold leading-[1.05]"
                    style={{ fontSize: "clamp(1.875rem, 3.6vw, 2.5rem)", color: "var(--kw-ink)", letterSpacing: "-0.025em" }}
                >
                    {language === "ta" ? "à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯" : "Settings"}
                </h1>
                <p className="mt-2 max-w-[60ch] font-tamil" style={{ color: "var(--kw-muted)" }}>
                    {language === "ta"
                        ? "à®•à¯à®°à®²à¯, à®…à®£à¯à®•à®²à¯, à®®à®±à¯à®±à¯à®®à¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ à®•à¯à®´à¯ à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆà®•à®³à¯ˆ à®‰à®³à¯à®³à®®à¯ˆà®•à¯à®•à®µà¯à®®à¯. à®®à®¾à®±à¯à®±à®™à¯à®•à®³à¯ à®‰à®Ÿà®©à¯‡ à®šà¯†à®¯à®²à¯à®ªà®Ÿà¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®•à®¿à®©à¯à®±à®©."
                        : "Configure voice, accessibility, and care-team alerts. Changes apply immediately."}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
                {/* Sidebar */}
                <nav className="flex flex-col gap-1">
                    {SECTIONS.map((s) => {
                        const active = section === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSection(s.id)}
                                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors"
                                style={{
                                    background: active ? "var(--kw-brand-tint)" : "transparent",
                                    color: active ? "var(--kw-brand-ink)" : "var(--kw-ink)",
                                }}
                                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--kw-bg-deep)"; }}
                                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                            >
                                <span className="font-tamil">{language === "ta" ? s.labelTa : s.labelEn}</span>
                                {active && <KwIcon name="chevronRight" size={14} />}
                            </button>
                        );
                    })}
                </nav>

                {/* Content */}
                <div className="flex flex-col gap-4">
                    {section === "voice" && (
                        <VoicePanel
                            patient={patient}
                            onUpdatePatient={onUpdatePatient}
                            language={language}
                            setLanguage={setLanguage}
                        />
                    )}
                    {section === "a11y" && (
                        <AccessibilityPanel
                            patient={patient}
                            onUpdatePatient={onUpdatePatient}
                            language={language}
                            nightMode={nightMode}
                            setNightMode={setNightMode}
                            scanMode={scanMode}
                            setScanMode={setScanMode}
                            scanInterval={scanInterval}
                            setScanInterval={setScanInterval}
                        />
                    )}
                    {section === "emergency" && (
                        <EmergencyPanel
                            patient={patient}
                            onUpdatePatient={onUpdatePatient}
                            language={language}
                        />
                    )}
                    {section === "phrases" && (
                        <Card>
                            <SectionHead
                                title={language === "ta" ? "à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿" : "Manage phrases"}
                                subtitle={language === "ta" ? "à®‡à®¨à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®°à¯à®•à¯à®•à®¾à®© à®ªà®²à®•à¯ˆ à®•à®Ÿà¯à®Ÿà®Ÿà®®à¯." : "Cards available on this patient's board."}
                            />
                            <AdminPanel
                                actions={actions}
                                onAdd={onActionAdd}
                                onEdit={onActionEdit}
                                onDelete={onActionDelete}
                                onReorder={onActionReorder}
                                onReset={onActionReset}
                                logs={logs}
                                language={language}
                                nightMode={nightMode}
                                syncState={syncState}
                                onRequestConfirm={onRequestConfirm}
                            />
                        </Card>
                    )}
                    {section === "care" && (
                        <CareTeamPanel
                            patient={patient}
                            onUpdatePatient={onUpdatePatient}
                            language={language}
                        />
                    )}
                    {section === "privacy" && (
                        <PrivacyPanel language={language} logs={logs} />
                    )}
                </div>
            </div>
        </>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Sub-panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function VoicePanel({ patient, onUpdatePatient, language, setLanguage }) {
    const [voices, setVoices] = useState([]);
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
        const update = () => setVoices(window.speechSynthesis.getVoices());
        update();
        window.speechSynthesis.addEventListener("voiceschanged", update);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
    }, []);

    const filteredVoices = useMemo(
        () => voices.filter((v) => v.lang.toLowerCase().startsWith(patient?.language === "ta" ? "ta" : "en")),
        [voices, patient?.language]
    );

    return (
        <Card>
            <SectionHead
                kicker={language === "ta" ? "à®•à¯à®°à®²à¯ & à®®à¯Šà®´à®¿" : "Voice & language"}
                title={language === "ta" ? "Kareway à®Žà®ªà¯à®ªà®Ÿà®¿ à®’à®²à®¿à®•à¯à®•à®¿à®±à®¤à¯" : "How Kareway sounds"}
            />
            <Row
                label={language === "ta" ? "à®•à¯à®°à®²à¯" : "Voice"}
                hint={language === "ta" ? "à®¨à¯‹à®¯à®¾à®³à®°à¯ à®’à®°à¯ à®…à®Ÿà¯à®Ÿà¯ˆà®¯à¯ˆ à®¤à®Ÿà¯à®Ÿà¯à®®à¯à®ªà¯‹à®¤à¯ à®‡à®¤à¯ à®‡à®¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯." : "Played when the patient taps a card."}
            >
                <select
                    value={patient?.voice || ""}
                    onChange={(e) => onUpdatePatient({ voice: e.target.value || null })}
                    className="kw-input"
                    style={{ minWidth: 220 }}
                >
                    <option value="">{language === "ta" ? "à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿" : "System default"}</option>
                    {filteredVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                        </option>
                    ))}
                </select>
            </Row>
            <Row
                label={language === "ta" ? "à®®à¯Šà®´à®¿" : "Language"}
                hint={language === "ta" ? "à®…à®Ÿà¯à®Ÿà¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à¯à®°à®²à¯ à®‡à®°à®£à¯à®Ÿà¯à®®à¯ à®®à®¾à®±à¯à®®à¯." : "Cards and voice both switch."}
            >
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="kw-input"
                    style={{ minWidth: 220 }}
                >
                    <option value="en">English</option>
                    <option value="ta">à®¤à®®à®¿à®´à¯ · Tamil</option>
                </select>
            </Row>
            <Row
                label={language === "ta" ? "à®ªà¯‡à®šà¯à®®à¯ à®µà¯‡à®•à®®à¯" : "Speaking rate"}
                hint={language === "ta" ? "à®®à¯†à®¤à¯à®µà®¾à®• = à®•à¯‡à®Ÿà¯à®• à®•à®Ÿà®¿à®©à®®à®¾à®© à®•à¯‡à®Ÿà¯à®ªà¯‹à®°à¯à®•à¯à®•à¯ à®¤à¯†à®³à®¿à®µà®¾à®•." : "Slower is clearer for hard-of-hearing listeners."}
            >
                <input
                    type="range"
                    min="0.5"
                    max="1.4"
                    step="0.05"
                    value={patient?.speakingRate ?? 0.9}
                    onChange={(e) => onUpdatePatient({ speakingRate: Number(e.target.value) })}
                    className="w-[260px]"
                    style={{ accentColor: "var(--kw-brand)" }}
                />
            </Row>
            <Row
                label={language === "ta" ? "à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿ à®ªà®°à®¿à®¨à¯à®¤à¯à®°à¯ˆà®•à®³à¯" : "Auto-show suggestions"}
                hint={language === "ta" ? "à®¨à®¾à®³à¯-à®¨à¯‡à®°à®®à¯ & à®µà®°à®²à®¾à®±à¯à®•à¯à®•à¯‡à®±à¯à®ª à®šà®¾à®¤à¯à®¤à®¿à®¯à®®à®¾à®© à®šà¯Šà®±à¯à®±à¯Šà®Ÿà®°à¯à®•à®³à¯ˆ à®•à®¾à®Ÿà¯à®Ÿà¯à®®à¯." : "Surfaces likely phrases by time-of-day and history."}
                last
            >
                <Toggle
                    checked={patient?.autoShowSuggestions !== false}
                    onChange={(v) => onUpdatePatient({ autoShowSuggestions: v })}
                />
            </Row>
        </Card>
    );
}

function AccessibilityPanel({
    patient,
    onUpdatePatient,
    language,
    nightMode,
    setNightMode,
    scanMode,
    setScanMode,
    scanInterval,
    setScanInterval,
}) {
    const a11y = patient?.accessibility || {};
    const update = (changes) => onUpdatePatient({ accessibility: { ...a11y, ...changes } });

    return (
        <Card>
            <SectionHead
                kicker={language === "ta" ? "à®…à®£à¯à®•à®²à¯" : "Accessibility"}
                title={language === "ta" ? "à®Žà®³à®¿à®¤à®¾à®• à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤ à®‰à®¤à®µà¯à®®à¯" : "Make it easier to use"}
            />
            <Row
                label={language === "ta" ? "à®ªà¯†à®°à®¿à®¯ à®Žà®´à¯à®¤à¯à®¤à¯ & à®…à®Ÿà¯à®Ÿà¯ˆà®•à®³à¯" : "Large text and cards"}
                hint={language === "ta" ? "à®…à®Ÿà¯à®Ÿà¯ˆ à®‰à®¯à®°à®®à¯ 240px à®†à®•à®µà¯à®®à¯ à®Žà®´à¯à®¤à¯à®¤à¯ 24px à®†à®•à®µà¯à®®à¯." : "Increases card height to 240 px and label size to 24 px."}
            >
                <Toggle checked={a11y.largeText || false} onChange={(v) => update({ largeText: v })} />
            </Row>
            <Row
                label={language === "ta" ? "à®…à®¤à®¿à®°à¯à®µà¯ à®ªà®¿à®©à¯à®©à¯‚à®Ÿà¯à®Ÿà®®à¯" : "Haptic feedback"}
                hint={language === "ta" ? "à®¤à®Ÿà¯à®Ÿà¯à®®à¯à®ªà¯‹à®¤à¯ à®…à®¤à®¿à®°à¯à®µà¯ (à®Ÿà®¾à®ªà¯à®²à¯†à®Ÿà¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯)." : "Buzz on tap (tablet only)."}
            >
                <Toggle checked={a11y.haptic ?? true} onChange={(v) => update({ haptic: v })} />
            </Row>

            <Row
                label={language === "ta" ? "à®¸à¯à®•à¯‡à®©à¯ à®®à¯à®±à¯ˆ (à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿ à®¤à¯‡à®°à¯à®µà¯)" : "Auto-scan mode"}
                hint={language === "ta"
                    ? "à®’à®µà¯à®µà¯Šà®°à¯ à®…à®Ÿà¯à®Ÿà¯ˆà®¯à®¾à®• à®šà¯à®´à®©à¯à®±à¯ à®¤à®©à®¿à®¤à¯à®¤à¯à®µà®®à®¾à®• à®’à®³à®¿à®°à¯à®µà®¿à®•à¯à®•à¯à®®à¯. Space à®…à®´à¯à®¤à¯à®¤à®¿à®©à®¾à®²à¯ à®¤à¯‡à®°à¯à®µà¯ à®šà¯†à®¯à¯à®¯à¯à®®à¯."
                    : "Cycles through cards one at a time. Press Space (or tap) to pick the highlighted card."}
            >
                <Toggle checked={scanMode} onChange={setScanMode} />
            </Row>
            {scanMode && (
                <Row
                    label={language === "ta" ? "à®¸à¯à®•à¯‡à®©à¯ à®µà¯‡à®•à®®à¯" : "Scan speed"}
                    hint={language === "ta" ? "à®’à®µà¯à®µà¯Šà®°à¯ à®…à®Ÿà¯à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®’à®³à®¿à®°à¯à®µà¯ à®Žà®µà¯à®µà®³à®µà¯ à®¨à¯‡à®°à®®à¯ à®¨à®¿à®±à¯à®•à¯à®®à¯." : "How long each card stays highlighted before advancing."}
                >
                    <select
                        value={scanInterval || 2000}
                        onChange={(e) => setScanInterval(Number(e.target.value))}
                        className="kw-input"
                        style={{ width: 130 }}
                    >
                        <option value={1000}>1.0s · {language === "ta" ? "à®µà¯‡à®•à®®à®¾à®•" : "Fast"}</option>
                        <option value={1500}>1.5s</option>
                        <option value={2000}>2.0s · {language === "ta" ? "à®šà®¾à®¤à®¾à®°à®£" : "Normal"}</option>
                        <option value={3000}>3.0s</option>
                        <option value={4000}>4.0s · {language === "ta" ? "à®®à¯†à®¤à¯à®µà®¾à®•" : "Slow"}</option>
                    </select>
                </Row>
            )}

            <Row
                label={language === "ta" ? "à®¤à®±à¯à®•à®¾à®²à®¿à®•-à®¤à¯‡à®°à¯à®µà¯ (Dwell)" : "Dwell-to-select"}
                hint={language === "ta"
                    ? "à®µà®°à®®à¯à®ªà®±à¯à®± à®‡à®¯à®•à¯à®•à®•à¯ à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®±à¯à®•à¯: à®’à®°à¯ à®…à®Ÿà¯à®Ÿà¯ˆà®¯à®¿à®©à¯ à®®à¯‡à®²à¯ à®¨à®¿à®±à¯à®•à®µà¯à®®à¯, à®šà®¿à®² à®µà®¿à®¨à®¾à®Ÿà®¿à®•à®³à®¿à®²à¯ à®¤à®¾à®©à®¾à®•à®µà¯‡ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯."
                    : "For limited motor control: hover over a card and it will auto-select after the dwell time."}
            >
                <Toggle checked={a11y.dwellToSelect || false} onChange={(v) => update({ dwellToSelect: v })} />
            </Row>
            {a11y.dwellToSelect && (
                <Row
                    label={language === "ta" ? "Dwell à®•à®¾à®²à®®à¯" : "Dwell duration"}
                    hint={language === "ta" ? "à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿ à®¤à¯‡à®°à¯à®µà¯à®•à¯à®•à¯ à®®à¯à®©à¯ à®•à®¾à®¤à¯à®¤à®¿à®°à¯à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà®¿à®¯ à®¨à¯‡à®°à®®à¯." : "Time to wait before auto-select fires."}
                >
                    <select
                        value={a11y.dwellMs || 1200}
                        onChange={(e) => update({ dwellMs: Number(e.target.value) })}
                        className="kw-input"
                        style={{ width: 130 }}
                    >
                        <option value={600}>0.6s</option>
                        <option value={1000}>1.0s</option>
                        <option value={1200}>1.2s</option>
                        <option value={1800}>1.8s</option>
                        <option value={2500}>2.5s</option>
                    </select>
                </Row>
            )}

            <Row
                label={language === "ta" ? "à®…à®¤à®¿à®• à®®à®¾à®±à¯à®ªà®¾à®Ÿà¯" : "🌙 Night mode"}
                hint={language === "ta" ? "à®µà®²à¯à®µà®¾à®© à®Žà®²à¯à®²à¯ˆà®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à®Ÿà®¿à®®à®©à®¾à®© à®Žà®´à¯à®¤à¯à®¤à¯." : "Dark theme for night shifts · easier on the eyes in dim lighting."}
                last
            >
                <Toggle checked={nightMode} onChange={setNightMode} />
            </Row>
        </Card>
    );
}

function EmergencyPanel({ patient, onUpdatePatient, language }) {
    const er = patient?.emergencyConfig || {};
    const update = (changes) => onUpdatePatient({ emergencyConfig: { ...er, ...changes } });
    const NOTIFY_OPTIONS = [
        { id: "on_call_nurse", labelTa: "à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®šà¯†à®µà®¿à®²à®¿à®¯à®°à¯", labelEn: "On-call nurse" },
        { id: "floor_team",    labelTa: "à®¤à®³à®ªà¯ à®ªà®£à®¿à®¯à®¾à®³à®°à¯",         labelEn: "Floor team" },
        { id: "spouse",        labelTa: "à®¤à¯à®£à¯ˆà®µà®°à¯",              labelEn: "Spouse" },
        { id: "doctor",        labelTa: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",            labelEn: "Doctor" },
    ];
    const notify = er.notify || [];

    return (
        <Card accent="er">
            <SectionHead
                kicker={language === "ta" ? "à®…à®µà®šà®°à®®à¯" : "Emergency"}
                title={language === "ta" ? "à®šà®¿à®µà®ªà¯à®ªà¯ à®ªà¯Šà®¤à¯à®¤à®¾à®©à¯ à®…à®´à¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®®à¯à®ªà¯‹à®¤à¯" : "When the red button is pressed"}
                accent="er"
            />
            <Row
                label={language === "ta" ? "à®ªà®¿à®Ÿà®¿à®¤à¯à®¤à¯ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯" : "Confirm with hold"}
                hint={language === "ta" ? "à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆ à®’à®²à®¿à®•à¯à®• à®®à¯à®©à¯ à®¨à¯‹à®¯à®¾à®³à®°à¯ 0.8s à®ªà®¿à®Ÿà®¿à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà¯à®®à¯." : "Patient must hold the emergency button 0.8s before alert fires."}
            >
                <Toggle checked={er.confirmWithHold ?? true} onChange={(v) => update({ confirmWithHold: v })} />
            </Row>
            <Row
                label={language === "ta" ? "à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆ" : "Notify"}
                hint={language === "ta" ? "à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆ à®’à®²à®¿à®•à¯à®•à¯à®®à¯ à®ªà¯‹à®¤à¯ à®¯à®¾à®°à¯ à®…à®´à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®µà®¾à®°à¯à®•à®³à¯." : "Who gets paged when an alert fires."}
            >
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[360px]">
                    {NOTIFY_OPTIONS.map((opt) => {
                        const on = notify.includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                onClick={() => update({
                                    notify: on ? notify.filter((n) => n !== opt.id) : [...notify, opt.id],
                                })}
                                className="px-2.5 py-1 rounded-full text-xs font-semibold transition-colors font-tamil"
                                style={{
                                    background: on ? "var(--kw-er-tint)" : "var(--kw-bg-deep)",
                                    color: on ? "var(--kw-er-deep)" : "var(--kw-muted)",
                                    border: `1px solid ${on ? "var(--kw-er-tint)" : "var(--kw-line)"}`,
                                }}
                            >
                                {language === "ta" ? opt.labelTa : opt.labelEn}
                            </button>
                        );
                    })}
                </div>
            </Row>
            <Row
                label={language === "ta" ? "à®ªà®¿à®Ÿà®¿à®•à¯à®•à¯à®®à¯ à®•à®¾à®² à®…à®³à®µà¯" : "Hold duration"}
                hint={language === "ta" ? "à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤ à®¨à¯‹à®¯à®¾à®³à®°à¯ à®Žà®µà¯à®µà®³à®µà¯ à®¨à¯‡à®°à®®à¯ à®ªà®¿à®Ÿà®¿à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà¯à®®à¯." : "How long the patient must hold to confirm."}
                last
            >
                <select
                    value={er.holdMs || 800}
                    onChange={(e) => update({ holdMs: Number(e.target.value) })}
                    className="kw-input"
                    style={{ width: 110 }}
                >
                    <option value={400}>0.4s</option>
                    <option value={800}>0.8s</option>
                    <option value={1200}>1.2s</option>
                    <option value={1600}>1.6s</option>
                </select>
            </Row>
        </Card>
    );
}

function CareTeamPanel({ patient, onUpdatePatient, language }) {
    const team = patient?.careTeam || [];
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState({ name: "", role: "Family", phone: "" });

    const removeMember = (id) => onUpdatePatient({ careTeam: team.filter((m) => m.id !== id) });
    const addMember = () => {
        if (!draft.name.trim()) return;
        const member = {
            id: Date.now().toString(),
            name: draft.name.trim(),
            role: draft.role,
            phone: draft.phone,
            initials: draft.name.trim()[0]?.toUpperCase() || "?",
        };
        onUpdatePatient({ careTeam: [...team, member] });
        setDraft({ name: "", role: "Family", phone: "" });
        setAdding(false);
    };

    return (
        <Card>
            <SectionHead
                kicker={language === "ta" ? "à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ à®•à¯à®´à¯" : "Care team"}
                title={language === "ta" ? "à®’à®°à¯-à®¤à®Ÿà¯à®Ÿà®¿à®²à¯ à®¯à®¾à®°à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à®¿à®±à®¾à®°à¯à®•à®³à¯" : "Who's available with one tap"}
            />
            <div className="space-y-2 mb-3">
                {team.length === 0 && (
                    <div className="text-sm py-3 text-center" style={{ color: "var(--kw-subtle)" }}>
                        {language === "ta" ? "à®‡à®©à¯à®©à¯à®®à¯ à®‰à®±à¯à®ªà¯à®ªà®¿à®©à®°à¯à®•à®³à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ." : "No members yet."}
                    </div>
                )}
                {team.map((m) => (
                    <div
                        key={m.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold"
                            style={{ background: "var(--kw-brand-tint)", color: "var(--kw-brand)" }}
                        >
                            {(m.initials || m.name?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-display font-semibold text-sm" style={{ color: "var(--kw-ink)" }}>
                                {m.name}
                            </div>
                            <div className="text-xs" style={{ color: "var(--kw-muted)" }}>
                                {m.role}{m.phone ? ` · ${m.phone}` : ""}
                            </div>
                        </div>
                        <button
                            onClick={() => removeMember(m.id)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold"
                            style={{ color: "var(--kw-er)" }}
                        >
                            {language === "ta" ? "à®¨à¯€à®•à¯à®•à¯" : "Remove"}
                        </button>
                    </div>
                ))}
            </div>

            {!adding ? (
                <button
                    onClick={() => setAdding(true)}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                        background: "var(--kw-brand)",
                        color: "white",
                    }}
                >
                    + {language === "ta" ? "à®‰à®±à¯à®ªà¯à®ªà®¿à®©à®°à¯ˆà®šà¯ à®šà¯‡à®°à¯" : "Add member"}
                </button>
            ) : (
                <div className="rounded-xl p-3 space-y-2" style={{ background: "var(--kw-bg-deep)", border: "1px solid var(--kw-line)" }}>
                    <input
                        autoFocus
                        value={draft.name}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        placeholder={language === "ta" ? "à®®à¯à®´à¯ à®ªà¯†à®¯à®°à¯" : "Full name"}
                        className="kw-input"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={draft.role}
                            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                            className="kw-input"
                        >
                            <option>Spouse</option>
                            <option>Son</option>
                            <option>Daughter</option>
                            <option>Family</option>
                            <option>Nurse</option>
                            <option>Doctor</option>
                        </select>
                        <input
                            value={draft.phone}
                            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                            placeholder={language === "ta" ? "à®¤à¯Šà®²à¯ˆà®ªà¯‡à®šà®¿" : "Phone (optional)"}
                            className="kw-input"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setAdding(false); setDraft({ name: "", role: "Family", phone: "" }); }}
                            className="flex-1 py-2 rounded-lg font-semibold text-sm border"
                            style={{ borderColor: "var(--kw-line)" }}
                        >
                            {language === "ta" ? "à®°à®¤à¯à®¤à¯" : "Cancel"}
                        </button>
                        <button
                            onClick={addMember}
                            className="flex-1 py-2 rounded-lg font-semibold text-sm text-white"
                            style={{ background: "var(--kw-brand)" }}
                        >
                            {language === "ta" ? "à®šà¯‡à®°à¯" : "Add"}
                        </button>
                    </div>
                </div>
            )}
        </Card>
    );
}

function PrivacyPanel({ language, logs }) {
    return (
        <Card>
            <SectionHead
                kicker={language === "ta" ? "à®¤à®©à®¿à®¯à¯à®°à®¿à®®à¯ˆ & à®¤à®£à®¿à®•à¯à®•à¯ˆ" : "Privacy & audit"}
                title={language === "ta" ? "à®‰à®™à¯à®•à®³à¯ à®¤à®°à®µà¯ à®Žà®™à¯à®•à¯ à®šà¯†à®²à¯à®•à®¿à®±à®¤à¯" : "Where your data goes"}
            />
            <div className="space-y-3 text-sm" style={{ color: "var(--kw-ink-soft)" }}>
                <p className="font-tamil">
                    {language === "ta"
                        ? "à®’à®µà¯à®µà¯Šà®°à¯ à®šà¯†à®¯à¯à®¤à®¿à®¯à¯à®®à¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ à®•à¯à®´à¯à®µà®¿à®±à¯à®•à®¾à®© à®¤à®£à®¿à®•à¯à®•à¯ˆ à®ªà®¤à®¿à®µà®¿à®²à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯. à®¤à®±à¯à®ªà¯‹à®¤à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®ªà®¤à®¿à®µà¯à®•à®³à¯: "
                        : "Every message is stored in an audit log for the care team. Currently stored: "}
                    <strong>{logs.length}</strong>.
                </p>
                <p className="font-tamil">
                    {language === "ta"
                        ? "à®¤à®°à®µà¯ à®‰à®™à¯à®•à®³à¯ à®µà®šà®¤à®¿ à®ªà®¿à®©à¯à®¤à®³à®®à¯ (Firebase à®…à®²à¯à®²à®¤à¯ local) à®®à®±à¯à®±à¯à®®à¯ à®šà®¾à®¤à®©à®¤à¯à®¤à®¿à®²à¯ à®¤à®±à¯à®•à®¾à®²à®¿à®•à®®à®¾à®• à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯. à®®à¯‚à®©à¯à®±à®¾à®®à¯ à®¤à®°à®ªà¯à®ªà®¿à®©à®°à¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ."
                        : "Data lives in your facility's backend (Firebase or local JSON) and the device cache. No third parties."}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `kareway-log-${new Date().toISOString().slice(0, 10)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="py-2.5 rounded-xl font-semibold text-sm border"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)" }}
                    >
                        {language === "ta" ? "JSON à®à®±à¯à®±à¯à®®à®¤à®¿" : "Export JSON"}
                    </button>
                    <button
                        onClick={() => {
                            const csv = ["timestamp,phrase,category,interaction"]
                                .concat(
                                    logs.map((l) => [
                                        l.timestamp,
                                        `"${(l.labelEnglish || l.labelTamil || "").replace(/"/g, '""')}"`,
                                        l.category,
                                        l.interactionType,
                                    ].join(","))
                                )
                                .join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `kareway-log-${new Date().toISOString().slice(0, 10)}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="py-2.5 rounded-xl font-semibold text-sm border"
                        style={{ borderColor: "var(--kw-line)", color: "var(--kw-ink)" }}
                    >
                        {language === "ta" ? "CSV à®à®±à¯à®±à¯à®®à®¤à®¿" : "Export CSV"}
                    </button>
                </div>
            </div>
        </Card>
    );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Shared atoms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function Card({ children, accent }) {
    return (
        <section
            className="rounded-3xl p-6"
            style={{
                background: "var(--kw-surface)",
                border: `1px solid ${accent === "er" ? "var(--kw-er-tint)" : "var(--kw-line)"}`,
                boxShadow: "var(--kw-shadow-sm)",
            }}
        >
            {children}
        </section>
    );
}

function SectionHead({ kicker, title, subtitle, accent }) {
    return (
        <div className="mb-4">
            {kicker && (
                <div
                    className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1"
                    style={{ color: accent === "er" ? "var(--kw-er)" : "var(--kw-brand)" }}
                >
                    {kicker}
                </div>
            )}
            <div
                className="font-display font-semibold leading-tight"
                style={{ fontSize: "1.375rem", color: "var(--kw-ink)", letterSpacing: "-0.018em" }}
            >
                {title}
            </div>
            {subtitle && (
                <div className="text-sm mt-1" style={{ color: "var(--kw-muted)" }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}

function Row({ label, hint, children, last }) {
    return (
        <div
            className="flex items-start justify-between gap-4 py-4"
            style={{ borderBottom: last ? "none" : "1px solid var(--kw-line)" }}
        >
            <div className="min-w-0">
                <div className="font-display font-semibold text-[15px]" style={{ color: "var(--kw-ink)" }}>
                    {label}
                </div>
                {hint && (
                    <div className="text-[12.5px] mt-0.5 font-tamil" style={{ color: "var(--kw-muted)" }}>
                        {hint}
                    </div>
                )}
            </div>
            <div className="shrink-0 flex items-center">{children}</div>
        </div>
    );
}

function Toggle({ checked, onChange }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className="relative inline-flex shrink-0 items-center rounded-full transition-colors"
            style={{
                width: 44,
                height: 24,
                padding: 2,
                background: checked ? "var(--kw-brand)" : "var(--kw-toggle-off)",
                boxShadow: "inset 0 1px 2px oklch(0 0 0 / 0.08)",
                cursor: "pointer",
            }}
            role="switch"
            aria-checked={checked}
        >
            <span
                className="rounded-full"
                style={{
                    width: 20,
                    height: 20,
                    background: "white",
                    transform: checked ? "translateX(20px)" : "translateX(0)",
                    transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 1px 3px oklch(0 0 0 / 0.25), 0 0 0 1px oklch(0 0 0 / 0.04)",
                    willChange: "transform",
                }}
            />
        </button>
    );
}
